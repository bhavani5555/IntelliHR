package com.intellihr.recruitment.analytics.dto;

public record CandidateSelectionStatisticsResponse(
        long totalCandidates,
        long selectedCandidates,
        long rejectedCandidates,
        long candidatesInProgress
) {
}
