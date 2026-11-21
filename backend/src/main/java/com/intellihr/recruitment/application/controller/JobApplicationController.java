package com.intellihr.recruitment.application.controller;

import com.intellihr.recruitment.application.dto.JobApplicationRequest;
import com.intellihr.recruitment.application.dto.CandidateJobApplicationRequest;
import com.intellihr.recruitment.application.dto.JobApplicationResponse;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.service.JobApplicationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationResponse> applyForJob(
            @Valid @RequestBody JobApplicationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyForJob(request));
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<JobApplicationResponse> applyAsCandidate(
            @Valid @RequestBody CandidateJobApplicationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyForJobAsCandidate(
                        authentication.getName(),
                        request
                ));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                applicationService.getMyApplications(authentication.getName())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationResponse> getApplicationById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobApplicationResponse>> getApplicationsByCandidate(
            @PathVariable Long candidateId
    ) {
        return ResponseEntity.ok(
                applicationService.getApplicationsByCandidate(candidateId)
        );
    }

    @GetMapping("/job/{jobOpeningId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobApplicationResponse>> getApplicationsByJobOpening(
            @PathVariable Long jobOpeningId
    ) {
        return ResponseEntity.ok(
                applicationService.getApplicationsByJobOpening(jobOpeningId)
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<JobApplicationResponse>> getApplicationsByStatus(
            @PathVariable JobApplicationStatus status
    ) {
        return ResponseEntity.ok(
                applicationService.getApplicationsByStatus(status)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<JobApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam JobApplicationStatus status
    ) {
        return ResponseEntity.ok(
                applicationService.updateApplicationStatus(id, status)
        );
    }

    @GetMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Resource> downloadApplicationResume(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume.pdf\""
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(applicationService.getApplicationResume(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}


