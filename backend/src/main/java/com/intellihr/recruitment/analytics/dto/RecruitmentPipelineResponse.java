package com.intellihr.recruitment.analytics.dto;

public record RecruitmentPipelineResponse(
        long totalApplications,
        long applied,
        long underReview,
        long shortlisted,
        long interviewScheduled,
        long selected,
        long rejected,
        long withdrawn
) {
}
