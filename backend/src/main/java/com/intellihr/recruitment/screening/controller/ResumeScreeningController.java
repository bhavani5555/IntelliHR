package com.intellihr.recruitment.screening.controller;

import com.intellihr.recruitment.screening.dto.ResumeScreeningResponse;
import com.intellihr.recruitment.screening.service.ResumeScreeningService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruitment/screening")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class ResumeScreeningController {

    private final ResumeScreeningService screeningService;

    public ResumeScreeningController(
            ResumeScreeningService screeningService
    ) {
        this.screeningService = screeningService;
    }

    @PostMapping("/{applicationId}")
    public ResponseEntity<ResumeScreeningResponse> screenResume(
            @PathVariable Long applicationId
    ) {
        return ResponseEntity.ok(
                screeningService.screenResume(applicationId)
        );
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ResumeScreeningResponse> getScreeningResult(
            @PathVariable Long applicationId
    ) {
        return ResponseEntity.ok(
                screeningService.getScreeningResult(applicationId)
        );
    }
}