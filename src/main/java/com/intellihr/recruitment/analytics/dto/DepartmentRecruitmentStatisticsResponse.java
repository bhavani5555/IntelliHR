package com.intellihr.recruitment.analytics.dto;

public record DepartmentRecruitmentStatisticsResponse(
        String department,
        long totalJobs,
        long totalApplications,
        long selectedApplications,
        long rejectedApplications
) {
}
