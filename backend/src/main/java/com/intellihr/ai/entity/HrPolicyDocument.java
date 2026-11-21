package com.intellihr.ai.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "hr_policy_documents")
@Getter
@Setter
@NoArgsConstructor
public class HrPolicyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String originalFileName;

    @Column(nullable = false, length = 255)
    private String storedFileName;

    @Column(nullable = false, length = 100)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private Integer totalChunks;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void onCreate() {
        uploadedAt = LocalDateTime.now();

        if (totalChunks == null) {
            totalChunks = 0;
        }
    }
}
