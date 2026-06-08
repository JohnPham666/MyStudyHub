package com.studyhub.schedule.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ClassSessionRequest {
    private String studentName;
    private String subject;
    private LocalDate date;
    private LocalTime time;
    private Integer duration;
    private String note;
}
