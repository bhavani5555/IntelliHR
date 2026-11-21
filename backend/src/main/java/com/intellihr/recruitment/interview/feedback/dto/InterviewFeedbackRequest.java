package com.intellihr.recruitment.interview.feedback.dto;

import com.intellihr.recruitment.interview.feedback.entity.InterviewRecommendation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InterviewFeedbackRequest(

        @NotNull(message = "Technical rating is required")
        @Min(value = 1, message = "Technical rating must be between 1 and 5")
        @Max(value = 5, message = "Technical rating must be between 1 and 5")
        Integer technicalRating,

        @NotNull(message = "Communication rating is required")
        @Min(value = 1, message = "Communication rating must be between 1 and 5")
        @Max(value = 5, message = "Communication rating must be between 1 and 5")
        Integer communicationRating,

        @NotNull(message = "Problem-solving rating is required")
        @Min(value = 1, message = "Problem-solving rating must be between 1 and 5")
        @Max(value = 5, message = "Problem-solving rating must be between 1 and 5")
        Integer problemSolvingRating,

        @NotBlank(message = "Strengths are required")
        @Size(max = 2000, message = "Strengths cannot exceed 2000 characters")
        String strengths,

        @NotBlank(message = "Areas for improvement are required")
        @Size(max = 2000, message = "Areas for improvement cannot exceed 2000 characters")
        String areasForImprovement,

        @NotBlank(message = "Comments are required")
        @Size(max = 3000, message = "Comments cannot exceed 3000 characters")
        String comments,

        @NotNull(message = "Recommendation is required")
        InterviewRecommendation recommendation

) {
}
