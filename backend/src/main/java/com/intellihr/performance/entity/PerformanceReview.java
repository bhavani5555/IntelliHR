package com.intellihr.performance.entity;

import com.intellihr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "performance_reviews",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_review_period",
            columnNames = {"employee_id", "review_period"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Column(name = "review_period", nullable = false, length = 50)
    private String reviewPeriod;

    @Column(nullable = false)
    private Integer overallRating;

    @Column(length = 2000)
    private String strengths;

    @Column(length = 2000)
    private String areasForImprovement;

    @Column(length = 2000)
    private String goals;

    @Column(length = 2000)
    private String feedback;

    @Column(length = 1000)
    private String employeeRemarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status;

    private LocalDate reviewDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = ReviewStatus.DRAFT;
        }

        if (reviewDate == null) {
            reviewDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
