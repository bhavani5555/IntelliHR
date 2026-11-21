package com.intellihr.recruitment.analytics.controller;

import com.intellihr.recruitment.analytics.dto.CandidateSelectionStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.DepartmentRecruitmentStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.InterviewStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.JobOpeningStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.RecruitmentPipelineResponse;

import com.intellihr.recruitment.analytics.service.RecruitmentAnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruitment-analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class RecruitmentAnalyticsController {

    private final RecruitmentAnalyticsService analyticsService;

    public RecruitmentAnalyticsController(
            RecruitmentAnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/pipeline")
    public ResponseEntity<RecruitmentPipelineResponse> getRecruitmentPipeline() {
        return ResponseEntity.ok(
                analyticsService.getRecruitmentPipeline()
        );
    }

    @GetMapping("/job-openings")
    public ResponseEntity<JobOpeningStatisticsResponse> getJobOpeningStatistics() {
        return ResponseEntity.ok(
                analyticsService.getJobOpeningStatistics()
        );
    }

    @GetMapping("/interviews")
    public ResponseEntity<InterviewStatisticsResponse> getInterviewStatistics() {
        return ResponseEntity.ok(
                analyticsService.getInterviewStatistics()
        );
    }

    @GetMapping("/candidates")
    public ResponseEntity<CandidateSelectionStatisticsResponse> getCandidateSelectionStatistics() {
        return ResponseEntity.ok(
                analyticsService.getCandidateSelectionStatistics()
        );
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentRecruitmentStatisticsResponse>>
    getDepartmentRecruitmentStatistics() {
        return ResponseEntity.ok(
                analyticsService.getDepartmentRecruitmentStatistics()
        );
    }
}
