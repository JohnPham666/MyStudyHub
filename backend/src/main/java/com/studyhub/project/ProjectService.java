package com.studyhub.project;

import com.studyhub.project.dto.ProjectDto;
import com.studyhub.project.dto.ProjectRequest;
import com.studyhub.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjects() {
        Long ownerId = CurrentUser.id();
        return projectRepository.findAllByOwnerId(ownerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(Long id) {
        return mapToDto(getProjectEntity(id));
    }

    @Transactional
    public ProjectDto createProject(ProjectRequest request) {
        Project project = new Project();
        project.setOwnerId(CurrentUser.id());
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        if (request.getProgress() != null) {
            project.setProgress(request.getProgress());
        }
        if (request.getMembers() != null) {
            project.setMembers(request.getMembers());
        }

        project = projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectRequest request) {
        Project project = getProjectEntity(id);

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getProgress() != null) project.setProgress(request.getProgress());
        if (request.getMembers() != null) {
            project.getMembers().clear();
            project.getMembers().addAll(request.getMembers());
        }

        project = projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectEntity(id);
        projectRepository.delete(project);
        // Note: Tasks associated with this project will have their project_id set to NULL 
        // due to the ON DELETE SET NULL foreign key constraint in the DB.
    }

    private Project getProjectEntity(Long id) {
        Long ownerId = CurrentUser.id();
        return projectRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    private ProjectDto mapToDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .progress(project.getProgress())
                .members(project.getMembers())
                .build();
    }
}
