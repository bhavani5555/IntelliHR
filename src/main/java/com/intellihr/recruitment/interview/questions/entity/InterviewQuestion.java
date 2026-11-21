package com.intellihr.recruitment.interview.questions.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String jobRole;

    @Column(nullable = false, length = 100)
    private String skill;

    @Column(nullable = false, length = 2000)
    private String questionText;

    @Column(nullable = false, length = 30)
    private String difficulty;

    @Column(nullable = false, length = 30)
    private String questionType;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}