package com.studyhub.resource;

import com.studyhub.resource.dto.ResourceDto;
import com.studyhub.resource.dto.ResourceRequest;
import com.studyhub.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<ResourceDto> getResources() {
        Long ownerId = CurrentUser.id();
        return resourceRepository.findAllByOwnerId(ownerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceDto getResource(Long id) {
        return mapToDto(getResourceEntity(id));
    }

    @Transactional
    public ResourceDto createResource(ResourceRequest request) {
        Resource resource = new Resource();
        resource.setOwnerId(CurrentUser.id());
        resource.setSubject(request.getSubject());
        resource.setFileLink(request.getFileLink());
        resource.setNote(request.getNote());
        if (request.getTags() != null) {
            resource.setTags(request.getTags());
        }

        resource = resourceRepository.save(resource);
        return mapToDto(resource);
    }

    @Transactional
    public ResourceDto updateResource(Long id, ResourceRequest request) {
        Resource resource = getResourceEntity(id);

        if (request.getSubject() != null) resource.setSubject(request.getSubject());
        if (request.getFileLink() != null) resource.setFileLink(request.getFileLink());
        if (request.getNote() != null) resource.setNote(request.getNote());
        if (request.getTags() != null) {
            resource.getTags().clear();
            resource.getTags().addAll(request.getTags());
        }

        resource = resourceRepository.save(resource);
        return mapToDto(resource);
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = getResourceEntity(id);
        resourceRepository.delete(resource);
    }

    private Resource getResourceEntity(Long id) {
        Long ownerId = CurrentUser.id();
        return resourceRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found"));
    }

    private ResourceDto mapToDto(Resource resource) {
        return ResourceDto.builder()
                .id(resource.getId())
                .subject(resource.getSubject())
                .fileLink(resource.getFileLink())
                .note(resource.getNote())
                .tags(resource.getTags())
                .build();
    }
}
