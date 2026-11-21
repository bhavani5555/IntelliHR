package com.intellihr.onboarding.dto;

public record OnboardingProgressResponse(

        Long employeeId,
        String employeeName,
        long totalTasks,
        long pendingTasks,
        long inProgressTasks,
        long completedTasks,
        long cancelledTasks,
        double completionPercentage
) {
}
