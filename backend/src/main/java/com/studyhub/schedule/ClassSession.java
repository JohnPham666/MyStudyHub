package com.studyhub.schedule;

import com.studyhub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "class_sessions")
@Getter
@Setter
@NoArgsConstructor
public class ClassSession extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(nullable = false, length = 150)
    private String subject;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "session_time", nullable = false)
    private LocalTime sessionTime;

    @Column(nullable = false)
    private int duration; // in minutes

    @Column(length = 1000)
    private String note;
}
