package com.intellihr.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HrPolicyQuestionRequest(

        @NotBlank(message = "Question is required")
        @Size(
                max = 2000,
                message = "Question must not exceed 2000 characters"
        )
        String question,

        Long conversationId

) {
}