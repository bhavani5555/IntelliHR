package com.intellihr.recruitment.analytics.service;

import com.intellihr.recruitment.analytics.dto.*;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;
import com.intellihr.recruitment.candidate.repository.CandidateRepository;
import com.intellihr.recruitment.entity.JobStatus;
import com.intellihr.recruitment.repository.JobOpeningRepository;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.repository.InterviewRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecruitmentAnalyticsServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private JobOpeningRepository jobOpeningRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @InjectMocks
    private RecruitmentAnalyticsService analyticsService;

    @Test
    void getRecruitmentPipelineShouldReturnCorrectTotals() {

        when(jobApplicationRepository.countByStatus(JobApplicationStatus.APPLIED))
                .thenReturn(5L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.UNDER_REVIEW))
                .thenReturn(3L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.SHORTLISTED))
                .thenReturn(2L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.INTERVIEW_SCHEDULED))
                .thenReturn(2L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.SELECTED))
                .thenReturn(1L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.REJECTED))
                .thenReturn(1L);
        when(jobApplicationRepository.countByStatus(JobApplicationStatus.WITHDRAWN))
                .thenReturn(1L);

        RecruitmentPipelineResponse response =
                analyticsService.getRecruitmentPipeline();

        assertEquals(15L, response.totalApplications());
        assertEquals(5L, response.applied());
        assertEquals(3L, response.underReview());
        assertEquals(2L, response.shortlisted());
        assertEquals(2L, response.interviewScheduled());
        assertEquals(1L, response.selected());
        assertEquals(1L, response.rejected());
        assertEquals(1L, response.withdrawn());
    }

    @Test
    void getJobOpeningStatisticsShouldReturnCorrectTotals() {

        when(jobOpeningRepository.countByStatus(JobStatus.OPEN))
                .thenReturn(4L);
        when(jobOpeningRepository.countByStatus(JobStatus.CLOSED))
                .thenReturn(2L);
        when(jobOpeningRepository.countByStatus(JobStatus.ON_HOLD))
                .thenReturn(1L);
        when(jobOpeningRepository.countByStatus(JobStatus.CANCELLED))
                .thenReturn(1L);

        JobOpeningStatisticsResponse response =
                analyticsService.getJobOpeningStatistics();

        assertEquals(8L, response.totalJobs());
        assertEquals(4L, response.openJobs());
        assertEquals(2L, response.closedJobs());
        assertEquals(1L, response.onHoldJobs());
        assertEquals(1L, response.cancelledJobs());
    }

    @Test
    void getInterviewStatisticsShouldReturnCorrectTotals() {

        when(interviewRepository.countByStatus(InterviewStatus.SCHEDULED))
                .thenReturn(3L);
        when(interviewRepository.countByStatus(InterviewStatus.COMPLETED))
                .thenReturn(5L);
        when(interviewRepository.countByStatus(InterviewStatus.CANCELLED))
                .thenReturn(2L);

        InterviewStatisticsResponse response =
                analyticsService.getInterviewStatistics();

        assertEquals(10L, response.totalInterviews());
        assertEquals(3L, response.scheduledInterviews());
        assertEquals(5L, response.completedInterviews());
        assertEquals(2L, response.cancelledInterviews());
    }

    @Test
    void getCandidateSelectionStatisticsShouldReturnCorrectCounts() {

        when(candidateRepository.count()).thenReturn(10L);

        when(jobApplicationRepository.countDistinctByCandidateIdAndStatusIn(
                List.of(JobApplicationStatus.SELECTED)
        )).thenReturn(2L);

        when(jobApplicationRepository.countDistinctByCandidateIdAndStatusIn(
                List.of(JobApplicationStatus.REJECTED)
        )).thenReturn(3L);

        when(jobApplicationRepository.countDistinctByCandidateIdAndStatusIn(
                List.of(
                        JobApplicationStatus.APPLIED,
                        JobApplicationStatus.UNDER_REVIEW,
                        JobApplicationStatus.SHORTLISTED,
                        JobApplicationStatus.INTERVIEW_SCHEDULED
                )
        )).thenReturn(5L);

        CandidateSelectionStatisticsResponse response =
                analyticsService.getCandidateSelectionStatistics();

        assertEquals(10L, response.totalCandidates());
        assertEquals(2L, response.selectedCandidates());
        assertEquals(3L, response.rejectedCandidates());
        assertEquals(5L, response.candidatesInProgress());
    }

    @Test
    void getDepartmentRecruitmentStatisticsShouldReturnCorrectCounts() {

        when(jobOpeningRepository.findDistinctDepartments())
                .thenReturn(List.of("Engineering"));

        when(jobOpeningRepository.countByDepartmentIgnoreCase("Engineering"))
                .thenReturn(3L);

        when(jobApplicationRepository.countByJobOpeningDepartmentIgnoreCase(
                "Engineering"
        )).thenReturn(8L);

        when(jobApplicationRepository.countByJobOpeningDepartmentIgnoreCaseAndStatus(
                "Engineering",
                JobApplicationStatus.SELECTED
        )).thenReturn(2L);

        when(jobApplicationRepository.countByJobOpeningDepartmentIgnoreCaseAndStatus(
                "Engineering",
                JobApplicationStatus.REJECTED
        )).thenReturn(1L);

        List<DepartmentRecruitmentStatisticsResponse> response =
                analyticsService.getDepartmentRecruitmentStatistics();

        assertEquals(1, response.size());

        DepartmentRecruitmentStatisticsResponse department = response.get(0);

        assertEquals("Engineering", department.department());
        assertEquals(3L, department.totalJobs());
        assertEquals(8L, department.totalApplications());
        assertEquals(2L, department.selectedApplications());
        assertEquals(1L, department.rejectedApplications());
    }
}