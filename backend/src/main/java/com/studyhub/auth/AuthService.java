package com.studyhub.auth;

import com.studyhub.auth.dto.*;
import com.studyhub.security.AuthenticatedUser;
import com.studyhub.security.CurrentUser;
import com.studyhub.security.JwtService;
import com.studyhub.user.User;
import com.studyhub.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-ttl-seconds}")
    private long refreshTtlSeconds;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        user = userRepository.save(user);

        AuthenticatedUser authUser = new AuthenticatedUser(user.getId(), user.getUsername(), user.getPassword(), user.isEnabled());
        String accessToken = jwtService.generateAccessToken(authUser);
        RefreshToken refreshToken = createRefreshToken(user);

        return buildAuthResponse(accessToken, refreshToken.getToken(), user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        AuthenticatedUser authUser = (AuthenticatedUser) auth.getPrincipal();
        User user = userRepository.findById(authUser.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(authUser);
        RefreshToken refreshToken = createRefreshToken(user);

        return buildAuthResponse(accessToken, refreshToken.getToken(), user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token is expired or revoked");
        }

        // Revoke the old token (Rotate-on-use)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        AuthenticatedUser authUser = new AuthenticatedUser(user.getId(), user.getUsername(), user.getPassword(), user.isEnabled());
        
        String newAccessToken = jwtService.generateAccessToken(authUser);
        RefreshToken newRefreshToken = createRefreshToken(user);

        return buildAuthResponse(newAccessToken, newRefreshToken.getToken(), user);
    }

    @Transactional
    public void logout(RefreshRequest request) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(request.getRefreshToken());
        tokenOpt.ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional(readOnly = true)
    public UserDto me() {
        Long currentUserId = CurrentUser.id();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return mapToDto(user);
    }

    private RefreshToken createRefreshToken(User user) {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        String tokenStr = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenStr);
        refreshToken.setExpiresAt(Instant.now().plusSeconds(refreshTtlSeconds));
        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToDto(user))
                .build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
