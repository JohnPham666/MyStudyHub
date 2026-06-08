package com.studyhub.schedule.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ClassSessionDto {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    private String studentName;
    private String subject;
    
    // Naming it "date" and "time" to match frontend's expected format precisely
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;
    
    private int duration;
    private String note;
}
