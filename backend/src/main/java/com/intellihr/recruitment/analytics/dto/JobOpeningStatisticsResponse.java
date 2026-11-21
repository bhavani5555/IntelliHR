package com.intellihr.recruitment.analytics.dto;

public record JobOpeningStatisticsResponse(
        long totalJobs,
        long openJobs,
        long closedJobs,
        long onHoldJobs,
        long cancelledJobs
) {
}
