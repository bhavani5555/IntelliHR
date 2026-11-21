package com.intellihr.recruitment.controller;

import com.intellihr.recruitment.dto.JobOpeningRequest;
import com.intellihr.recruitment.dto.JobOpeningResponse;
import com.intellihr.recruitment.dto.JobStatusUpdateRequest;
import com.intellihr.recruitment.entity.JobStatus;
import com.intellihr.recruitment.service.JobOpeningService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-openings")
public class JobOpeningController {

    private final JobOpeningService jobOpeningService;

    public JobOpeningController(JobOpeningService jobOpeningService) {
        this.jobOpeningService = jobOpeningService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOpeningResponse> createJobOpening(
            @Valid @RequestBody JobOpeningRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobOpeningService.createJobOpening(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobOpeningResponse>> getAllJobOpenings() {
        return ResponseEntity.ok(jobOpeningService.getAllJobOpenings());
    }

    @GetMapping("/public")
    public ResponseEntity<List<JobOpeningResponse>> getPublicJobOpenings() {
        return ResponseEntity.ok(jobOpeningService.getPublicJobOpenings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOpeningResponse> getJobOpeningById(
            @PathVariable Long id) {

        return ResponseEntity.ok(jobOpeningService.getJobOpeningById(id));
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobOpeningResponse>> getJobsByDepartment(
            @PathVariable String department) {

        return ResponseEntity.ok(
                jobOpeningService.getJobsByDepartment(department));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobOpeningResponse>> getJobsByStatus(
            @PathVariable JobStatus status) {

        return ResponseEntity.ok(jobOpeningService.getJobsByStatus(status));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobOpeningResponse>> searchJobsByTitle(
            @RequestParam String title) {

        return ResponseEntity.ok(jobOpeningService.searchJobsByTitle(title));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOpeningResponse> updateJobOpening(
            @PathVariable Long id,
            @Valid @RequestBody JobOpeningRequest request) {

        return ResponseEntity.ok(
                jobOpeningService.updateJobOpening(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobOpeningResponse> updateJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody JobStatusUpdateRequest request) {

        return ResponseEntity.ok(
                jobOpeningService.updateJobStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJobOpening(@PathVariable Long id) {

        jobOpeningService.deleteJobOpening(id);
        return ResponseEntity.noContent().build();
    }
}

