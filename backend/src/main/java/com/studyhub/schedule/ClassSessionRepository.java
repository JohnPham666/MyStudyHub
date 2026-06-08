package com.studyhub.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findAllByOwnerId(Long ownerId);
    Optional<ClassSession> findByIdAndOwnerId(Long id, Long ownerId);
}
