package com.intellihr.ai.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "hr_policy_chunks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_policy_document_chunk",
            columnNames = {"policy_document_id", "chunk_index"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class HrPolicyChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_document_id", nullable = false)
    private HrPolicyDocument policyDocument;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String embeddingJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
