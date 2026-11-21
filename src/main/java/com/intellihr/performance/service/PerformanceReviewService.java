package com.intellihr.performance.service;

import com.intellihr.performance.dto.PerformanceReviewRequest;
import com.intellihr.performance.dto.PerformanceReviewResponse;
import com.intellihr.performance.dto.ReviewStatusUpdateRequest;
import com.intellihr.performance.entity.ReviewStatus;

import java.util.List;

public interface PerformanceReviewService {

    PerformanceReviewResponse createReview(PerformanceReviewRequest request);

    List<PerformanceReviewResponse> getAllReviews();

    PerformanceReviewResponse getReviewById(Long id);

    List<PerformanceReviewResponse> getEmployeeReviews(Long employeeId);

    List<PerformanceReviewResponse> getReviewsByReviewer(Long reviewerId);

    List<PerformanceReviewResponse> getReviewsByStatus(ReviewStatus status);

    PerformanceReviewResponse submitReview(Long id);

    PerformanceReviewResponse acknowledgeReview(
        Long id,
        ReviewStatusUpdateRequest request
    );

    void deleteReview(Long id);
}
