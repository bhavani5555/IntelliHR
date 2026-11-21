package com.intellihr.onboarding.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record OnboardingTaskRequest(

        @NotNull(message = "Employee ID is required")
        Long employeeId,

        @NotBlank(message = "Task title is required")
        @Size(max = 150, message = "Task title cannot exceed 150 characters")
        String title,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDate dueDate
) {
}
