package com.intellihr.recruitment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_openings")
@Getter
@Setter
@NoArgsConstructor
public class JobOpening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(length = 2000)
    private String requiredSkills;

    @Column(nullable = false)
    private Integer numberOfVacancies;

    @Column(nullable = false, length = 50)
    private String employmentType;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(precision = 12, scale = 2)
    private BigDecimal minimumSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal maximumSalary;

    @Column(nullable = false)
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = JobStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
