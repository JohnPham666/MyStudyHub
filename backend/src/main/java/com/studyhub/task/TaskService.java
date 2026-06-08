package com.studyhub.task;

import com.studyhub.security.CurrentUser;
import com.studyhub.task.dto.CreateTaskRequest;
import com.studyhub.task.dto.TaskDto;
import com.studyhub.task.dto.UpdateTaskRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks() {
        Long ownerId = CurrentUser.id();
        return taskRepository.findAllByOwnerId(ownerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(Long id) {
        Task task = getTaskEntity(id);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto createTask(CreateTaskRequest request) {
        Task task = new Task();
        task.setOwnerId(CurrentUser.id());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus() != null ? request.getStatus() : Status.TODO);
        task.setCategory(request.getCategory());
        task.setDeadline(request.getDeadline());
        task.setProjectId(request.getProjectId());

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, UpdateTaskRequest request) {
        Task task = getTaskEntity(id);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getCategory() != null) task.setCategory(request.getCategory());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getProjectId() != null) task.setProjectId(request.getProjectId());

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskEntity(id);
        taskRepository.delete(task);
    }

    private Task getTaskEntity(Long id) {
        Long ownerId = CurrentUser.id();
        return taskRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .category(task.getCategory())
                .deadline(task.getDeadline())
                .build();
    }
}
