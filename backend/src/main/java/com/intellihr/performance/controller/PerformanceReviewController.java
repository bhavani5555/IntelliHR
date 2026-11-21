package com.intellihr.performance.controller;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.performance.dto.PerformanceReviewRequest;
import com.intellihr.performance.dto.PerformanceReviewResponse;
import com.intellihr.performance.dto.ReviewStatusUpdateRequest;
import com.intellihr.performance.entity.ReviewStatus;
import com.intellihr.performance.service.PerformanceReviewService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/performance-reviews")
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;
    private final EmployeeRepository employeeRepository;

    public PerformanceReviewController(
            PerformanceReviewService reviewService,
            EmployeeRepository employeeRepository) {
        this.reviewService = reviewService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PerformanceReviewResponse> createReview(
            @Valid @RequestBody PerformanceReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PerformanceReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<PerformanceReviewResponse> getReviewById(
            @PathVariable Long id,
            Authentication authentication) {

        PerformanceReviewResponse response = reviewService.getReviewById(id);
        checkEmployeeOwnership(response.employeeId(), authentication);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<PerformanceReviewResponse>> getEmployeeReviews(
            @PathVariable Long employeeId,
            Authentication authentication) {

        checkEmployeeOwnership(employeeId, authentication);

        return ResponseEntity.ok(
                reviewService.getEmployeeReviews(employeeId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PerformanceReviewResponse>> getReviewsByReviewer(
            @PathVariable Long reviewerId) {
        return ResponseEntity.ok(
                reviewService.getReviewsByReviewer(reviewerId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PerformanceReviewResponse>> getReviewsByStatus(
            @PathVariable ReviewStatus status) {
        return ResponseEntity.ok(
                reviewService.getReviewsByStatus(status));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PerformanceReviewResponse> submitReview(
            @PathVariable Long id) {
        return ResponseEntity.ok(reviewService.submitReview(id));
    }

    @PatchMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<PerformanceReviewResponse> acknowledgeReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewStatusUpdateRequest request,
            Authentication authentication) {

        PerformanceReviewResponse response = reviewService.getReviewById(id);
        checkEmployeeOwnership(response.employeeId(), authentication);

        return ResponseEntity.ok(
                reviewService.acknowledgeReview(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    private void checkEmployeeOwnership(
            Long employeeId,
            Authentication authentication) {

        boolean isPrivileged = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                                || authority.getAuthority().equals("ROLE_HR"));

        if (isPrivileged) {
            return;
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        System.out.println("========== PERFORMANCE OWNERSHIP DEBUG ==========");
        System.out.println("Employee ID: " + employeeId);
        System.out.println("Employee email: " + employee.getEmail());
        System.out.println("Authenticated username: " + authentication.getName());
        System.out.println("Authenticated roles: " + authentication.getAuthorities());
        System.out.println("==================================================");

        if (!employee.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only access your own performance reviews");
        }
    }
}