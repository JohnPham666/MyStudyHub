package com.studyhub.resource;

import com.studyhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
public class Resource extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(name = "file_link", nullable = false, length = 500)
    private String fileLink;

    @Column(length = 1000)
    private String note;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_tags", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
}
