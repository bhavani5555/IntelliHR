package com.intellihr.recruitment.interview.questions.dto;

import java.time.LocalDateTime;

public record InterviewQuestionResponse(
        Long id,
        String jobRole,
        String skill,
        String questionText,
        String difficulty,
        String questionType,
        LocalDateTime createdAt
) {
}