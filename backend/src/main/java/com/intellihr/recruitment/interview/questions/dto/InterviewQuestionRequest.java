package com.intellihr.recruitment.interview.questions.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InterviewQuestionRequest(

        @NotBlank
        @Size(max = 150)
        String jobRole,

        @NotBlank
        @Size(max = 100)
        String skill,

        @NotBlank
        String difficulty,

        @NotBlank
        String questionType,

        @NotNull
        @Min(1)
        @Max(20)
        Integer numberOfQuestions
) {
}