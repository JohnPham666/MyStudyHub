package com.studyhub.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findAllByOwnerId(Long ownerId);
    Optional<Resource> findByIdAndOwnerId(Long id, Long ownerId);
}
