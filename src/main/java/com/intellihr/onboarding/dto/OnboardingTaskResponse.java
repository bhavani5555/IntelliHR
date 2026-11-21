package com.intellihr.onboarding.dto;

import com.intellihr.onboarding.entity.OnboardingTaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OnboardingTaskResponse(

        Long id,
        Long employeeId,
        String employeeName,
        String employeeEmail,
        String title,
        String description,
        LocalDate dueDate,
        OnboardingTaskStatus status,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt
) {
}
