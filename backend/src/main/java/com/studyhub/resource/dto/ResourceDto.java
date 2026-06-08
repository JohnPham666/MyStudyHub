package com.studyhub.resource.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResourceDto {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    private String subject;
    private String fileLink;
    private String note;
    private List<String> tags;
}
