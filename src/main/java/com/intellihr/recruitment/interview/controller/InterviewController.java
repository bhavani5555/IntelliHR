package com.intellihr.recruitment.interview.controller;

import com.intellihr.recruitment.interview.dto.InterviewRequest;
import com.intellihr.recruitment.interview.dto.InterviewResponse;
import com.intellihr.recruitment.interview.dto.InterviewRescheduleRequest;
import com.intellihr.recruitment.interview.dto.InterviewStatusUpdateRequest;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.service.InterviewService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @Valid @RequestBody InterviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interviewService.scheduleInterview(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<InterviewResponse>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<InterviewResponse>> getMyInterviews() {
        return ResponseEntity.ok(interviewService.getMyInterviews());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<InterviewResponse> getInterviewById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }

    @GetMapping("/application/{jobApplicationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByApplication(
            @PathVariable Long jobApplicationId
    ) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByApplication(jobApplicationId)
        );
    }

    @GetMapping("/interviewer/{interviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByInterviewer(
            @PathVariable Long interviewerId
    ) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByInterviewer(interviewerId)
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByStatus(
            @PathVariable InterviewStatus status
    ) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByStatus(status)
        );
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<InterviewResponse> rescheduleInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRescheduleRequest request
    ) {
        return ResponseEntity.ok(
                interviewService.rescheduleInterview(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<InterviewResponse> updateInterviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody InterviewStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(
                interviewService.updateInterviewStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}
