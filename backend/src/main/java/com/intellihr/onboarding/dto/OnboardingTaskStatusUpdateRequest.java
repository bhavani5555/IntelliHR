package com.intellihr.onboarding.dto;

import com.intellihr.onboarding.entity.OnboardingTaskStatus;

import jakarta.validation.constraints.NotNull;

public record OnboardingTaskStatusUpdateRequest(

        @NotNull(message = "Task status is required")
        OnboardingTaskStatus status
) {
}
