package com.studyhub.task;

import com.studyhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
public class Task extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    // Use custom converter or keep it string and convert. 
    // We will use standard Enumerated and relying on matching DB values if we convert it well, but JPA might write "IN_PROGRESS" instead of "In Progress"
    // Let's use standard JPA @Convert to be safe with DB string if needed, or simply let Hibernate map enum name directly if we rename enums to match DB EXACTLY.
    // Wait, the Flyway script expects 'In Progress'. Standard JPA @Enumerated(STRING) uses enum name `IN_PROGRESS`.
    // Let's write an AttributeConverter for Status and Category.
    
    @Convert(converter = StatusConverter.class)
    @Column(nullable = false, length = 20)
    private Status status;

    @Convert(converter = CategoryConverter.class)
    @Column(nullable = false, length = 30)
    private Category category;

    private Instant deadline;
}
