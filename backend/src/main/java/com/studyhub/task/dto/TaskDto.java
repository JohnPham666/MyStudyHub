package com.studyhub.task.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.studyhub.task.Category;
import com.studyhub.task.Priority;
import com.studyhub.task.Status;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TaskDto {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @JsonSerialize(using = ToStringSerializer.class)
    private Long projectId;
    
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private Category category;
    private Instant deadline;
}
