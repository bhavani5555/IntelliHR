package com.intellihr.recruitment.application.entity;

import com.intellihr.recruitment.candidate.entity.Candidate;
import com.intellihr.recruitment.entity.JobOpening;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "job_applications",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_candidate_job_application",
            columnNames = {"candidate_id", "job_opening_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_opening_id", nullable = false)
    private JobOpening jobOpening;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobApplicationStatus status;

    @Column(length = 2000)
    private String coverLetter;

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = JobApplicationStatus.APPLIED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
