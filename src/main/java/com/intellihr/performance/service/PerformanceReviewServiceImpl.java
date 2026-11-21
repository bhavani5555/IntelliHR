package com.intellihr.performance.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.performance.dto.PerformanceReviewRequest;
import com.intellihr.performance.dto.PerformanceReviewResponse;
import com.intellihr.performance.dto.ReviewStatusUpdateRequest;
import com.intellihr.performance.entity.PerformanceReview;
import com.intellihr.performance.entity.ReviewStatus;
import com.intellihr.performance.repository.PerformanceReviewRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PerformanceReviewServiceImpl implements PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;

    public PerformanceReviewServiceImpl(
            PerformanceReviewRepository reviewRepository,
            EmployeeRepository employeeRepository) {
        this.reviewRepository = reviewRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public PerformanceReviewResponse createReview(PerformanceReviewRequest request) {

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        Employee reviewer = employeeRepository.findById(request.reviewerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Reviewer not found"));

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cannot review an inactive employee");
        }

        if (!reviewer.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Reviewer must be active");
        }

        if (reviewRepository.existsByEmployeeIdAndReviewPeriod(
                request.employeeId(), request.reviewPeriod().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A review already exists for this employee and review period");
        }

        PerformanceReview review = new PerformanceReview();
        review.setEmployee(employee);
        review.setReviewer(reviewer);
        review.setReviewPeriod(request.reviewPeriod().trim());
        review.setOverallRating(request.overallRating());
        review.setStrengths(request.strengths());
        review.setAreasForImprovement(request.areasForImprovement());
        review.setGoals(request.goals());
        review.setFeedback(request.feedback());
        review.setStatus(ReviewStatus.DRAFT);
        review.setReviewDate(LocalDate.now());

        return mapToResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByReviewDateDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceReviewResponse getReviewById(Long id) {
        return mapToResponse(findReviewById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getEmployeeReviews(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Employee not found");
        }

        return reviewRepository.findByEmployeeIdOrderByReviewDateDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getReviewsByReviewer(Long reviewerId) {

        if (!employeeRepository.existsById(reviewerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Reviewer not found");
        }

        return reviewRepository.findByReviewerIdOrderByReviewDateDesc(reviewerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getReviewsByStatus(ReviewStatus status) {
        return reviewRepository.findByStatusOrderByReviewDateDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PerformanceReviewResponse submitReview(Long id) {

        PerformanceReview review = findReviewById(id);

        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only draft reviews can be submitted");
        }

        review.setStatus(ReviewStatus.SUBMITTED);

        return mapToResponse(reviewRepository.save(review));
    }

    @Override
    public PerformanceReviewResponse acknowledgeReview(
            Long id,
            ReviewStatusUpdateRequest request) {

        PerformanceReview review = findReviewById(id);

        if (review.getStatus() != ReviewStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only submitted reviews can be acknowledged");
        }

        review.setEmployeeRemarks(request.employeeRemarks());
        review.setStatus(ReviewStatus.ACKNOWLEDGED);

        return mapToResponse(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long id) {

        PerformanceReview review = findReviewById(id);

        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only draft reviews can be deleted");
        }

        reviewRepository.delete(review);
    }

    private PerformanceReview findReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Performance review not found"));
    }

    private PerformanceReviewResponse mapToResponse(PerformanceReview review) {

        Employee employee = review.getEmployee();
        Employee reviewer = review.getReviewer();

        return new PerformanceReviewResponse(
                review.getId(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                reviewer.getId(),
                reviewer.getFirstName() + " " + reviewer.getLastName(),
                review.getReviewPeriod(),
                review.getOverallRating(),
                review.getStrengths(),
                review.getAreasForImprovement(),
                review.getGoals(),
                review.getFeedback(),
                review.getEmployeeRemarks(),
                review.getStatus(),
                review.getReviewDate(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
