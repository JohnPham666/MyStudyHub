package com.studyhub.task.dto;

import com.studyhub.task.Category;
import com.studyhub.task.Priority;
import com.studyhub.task.Status;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateTaskRequest {
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private Category category;
    private Instant deadline;
    private Long projectId;
}
