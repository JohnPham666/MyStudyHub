package com.studyhub.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class CurrentUser {
    public static Long id() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null; // Or throw an exception
        }
        return ((AuthenticatedUser) auth.getPrincipal()).userId();
    }
}
