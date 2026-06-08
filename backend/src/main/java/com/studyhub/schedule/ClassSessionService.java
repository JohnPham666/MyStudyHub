package com.studyhub.schedule;

import com.studyhub.schedule.dto.ClassSessionDto;
import com.studyhub.schedule.dto.ClassSessionRequest;
import com.studyhub.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository classSessionRepository;

    @Transactional(readOnly = true)
    public List<ClassSessionDto> getSessions() {
        Long ownerId = CurrentUser.id();
        return classSessionRepository.findAllByOwnerId(ownerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassSessionDto getSession(Long id) {
        return mapToDto(getSessionEntity(id));
    }

    @Transactional
    public ClassSessionDto createSession(ClassSessionRequest request) {
        ClassSession session = new ClassSession();
        session.setOwnerId(CurrentUser.id());
        session.setStudentName(request.getStudentName());
        session.setSubject(request.getSubject());
        session.setSessionDate(request.getDate());
        session.setSessionTime(request.getTime());
        if (request.getDuration() != null) {
            session.setDuration(request.getDuration());
        }
        session.setNote(request.getNote());

        session = classSessionRepository.save(session);
        return mapToDto(session);
    }

    @Transactional
    public ClassSessionDto updateSession(Long id, ClassSessionRequest request) {
        ClassSession session = getSessionEntity(id);

        if (request.getStudentName() != null) session.setStudentName(request.getStudentName());
        if (request.getSubject() != null) session.setSubject(request.getSubject());
        if (request.getDate() != null) session.setSessionDate(request.getDate());
        if (request.getTime() != null) session.setSessionTime(request.getTime());
        if (request.getDuration() != null) session.setDuration(request.getDuration());
        if (request.getNote() != null) session.setNote(request.getNote());

        session = classSessionRepository.save(session);
        return mapToDto(session);
    }

    @Transactional
    public void deleteSession(Long id) {
        ClassSession session = getSessionEntity(id);
        classSessionRepository.delete(session);
    }

    private ClassSession getSessionEntity(Long id) {
        Long ownerId = CurrentUser.id();
        return classSessionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Class session not found"));
    }

    private ClassSessionDto mapToDto(ClassSession session) {
        return ClassSessionDto.builder()
                .id(session.getId())
                .studentName(session.getStudentName())
                .subject(session.getSubject())
                .date(session.getSessionDate())
                .time(session.getSessionTime())
                .duration(session.getDuration())
                .note(session.getNote())
                .build();
    }
}
