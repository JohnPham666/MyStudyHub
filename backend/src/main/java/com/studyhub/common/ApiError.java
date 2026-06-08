package com.studyhub.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    @Builder.Default
    private Instant timestamp = Instant.now();
    private int status;
    private String message;
    private String path;
    private Map<String, String> fieldErrors;
}
