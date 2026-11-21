package com.intellihr.recruitment.interview.feedback.controller;

import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackRequest;
import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackResponse;
import com.intellihr.recruitment.interview.feedback.service.InterviewFeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewFeedbackController {

    private final InterviewFeedbackService feedbackService;

    public InterviewFeedbackController(
            InterviewFeedbackService feedbackService
    ) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/{interviewId}/feedback")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<InterviewFeedbackResponse> submitFeedback(
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewFeedbackRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.submitFeedback(interviewId, request));
    }

    @GetMapping("/{interviewId}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<InterviewFeedbackResponse> getFeedbackByInterview(
            @PathVariable Long interviewId
    ) {
        return ResponseEntity.ok(
                feedbackService.getFeedbackByInterview(interviewId)
        );
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<InterviewFeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
