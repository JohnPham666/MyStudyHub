package com.studyhub.project.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ProjectDto {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private int progress;
    private List<String> members;
}
