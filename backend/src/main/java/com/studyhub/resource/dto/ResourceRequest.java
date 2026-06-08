package com.studyhub.resource.dto;

import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {
    private String subject;
    private String fileLink;
    private String note;
    private List<String> tags;
}
