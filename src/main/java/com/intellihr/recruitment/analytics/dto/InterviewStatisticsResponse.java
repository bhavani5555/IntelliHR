package com.intellihr.recruitment.analytics.dto;

public record InterviewStatisticsResponse(
        long totalInterviews,
        long scheduledInterviews,
        long completedInterviews,
        long cancelledInterviews
) {
}
