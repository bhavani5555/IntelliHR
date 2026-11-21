package com.intellihr.recruitment.screening.entity;

import com.intellihr.recruitment.application.entity.JobApplication;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume_screenings")
@Getter
@Setter
@NoArgsConstructor
public class ResumeScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private JobApplication application;

    @Column(nullable = false)
    private Double matchPercentage;

    @Column(length = 3000)
    private String matchedSkills;

    @Column(length = 3000)
    private String missingSkills;

    @Column(length = 2000)
    private String summary;

    private LocalDateTime screenedAt;

    @PrePersist
    protected void onCreate() {
        screenedAt = LocalDateTime.now();
    }
}