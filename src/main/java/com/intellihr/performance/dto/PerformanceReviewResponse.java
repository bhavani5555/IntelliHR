package com.intellihr.performance.dto;

import com.intellihr.performance.entity.ReviewStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PerformanceReviewResponse(
    Long id,
    Long employeeId,
    String employeeName,
    Long reviewerId,
    String reviewerName,
    String reviewPeriod,
    Integer overallRating,
    String strengths,
    String areasForImprovement,
    String goals,
    String feedback,
    String employeeRemarks,
    ReviewStatus status,
    LocalDate reviewDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
