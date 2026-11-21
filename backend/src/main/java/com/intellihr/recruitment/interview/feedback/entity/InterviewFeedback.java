package com.intellihr.recruitment.interview.feedback.entity;

import com.intellihr.recruitment.interview.entity.Interview;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "interview_feedback",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_interview_feedback_interview",
                        columnNames = "interview_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    @Column(nullable = false)
    private Integer technicalRating;

    @Column(nullable = false)
    private Integer communicationRating;

    @Column(nullable = false)
    private Integer problemSolvingRating;

    @Column(nullable = false, length = 2000)
    private String strengths;

    @Column(nullable = false, length = 2000)
    private String areasForImprovement;

    @Column(nullable = false, length = 3000)
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewRecommendation recommendation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
