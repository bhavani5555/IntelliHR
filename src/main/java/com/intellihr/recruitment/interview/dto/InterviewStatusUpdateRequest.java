package com.intellihr.recruitment.interview.dto;

import com.intellihr.recruitment.interview.entity.InterviewStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InterviewStatusUpdateRequest(

        @NotNull(message = "Interview status is required")
        InterviewStatus status,

        @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
        String cancellationReason

) {
}
