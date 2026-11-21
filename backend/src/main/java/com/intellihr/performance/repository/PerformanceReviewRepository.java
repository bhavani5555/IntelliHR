package com.intellihr.performance.repository;

import com.intellihr.performance.entity.PerformanceReview;
import com.intellihr.performance.entity.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceReviewRepository
        extends JpaRepository<PerformanceReview, Long> {

    List<PerformanceReview> findAllByOrderByReviewDateDesc();

    List<PerformanceReview> findByEmployeeIdOrderByReviewDateDesc(
        Long employeeId
    );

    List<PerformanceReview> findByReviewerIdOrderByReviewDateDesc(
        Long reviewerId
    );

    List<PerformanceReview> findByStatusOrderByReviewDateDesc(
        ReviewStatus status
    );

    Optional<PerformanceReview> findByEmployeeIdAndReviewPeriod(
        Long employeeId,
        String reviewPeriod
    );

    boolean existsByEmployeeIdAndReviewPeriod(
        Long employeeId,
        String reviewPeriod
    );
}
