package com.intellihr.recruitment.analytics.service;

import com.intellihr.recruitment.analytics.dto.CandidateSelectionStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.DepartmentRecruitmentStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.InterviewStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.JobOpeningStatisticsResponse;
import com.intellihr.recruitment.analytics.dto.RecruitmentPipelineResponse;

import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;

import com.intellihr.recruitment.candidate.repository.CandidateRepository;

import com.intellihr.recruitment.entity.JobStatus;
import com.intellihr.recruitment.repository.JobOpeningRepository;

import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.repository.InterviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RecruitmentAnalyticsService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;

    public RecruitmentAnalyticsService(
            JobApplicationRepository jobApplicationRepository,
            JobOpeningRepository jobOpeningRepository,
            InterviewRepository interviewRepository,
            CandidateRepository candidateRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobOpeningRepository = jobOpeningRepository;
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
    }

    public RecruitmentPipelineResponse getRecruitmentPipeline() {

        long applied = jobApplicationRepository.countByStatus(
                JobApplicationStatus.APPLIED
        );

        long underReview = jobApplicationRepository.countByStatus(
                JobApplicationStatus.UNDER_REVIEW
        );

        long shortlisted = jobApplicationRepository.countByStatus(
                JobApplicationStatus.SHORTLISTED
        );

        long interviewScheduled = jobApplicationRepository.countByStatus(
                JobApplicationStatus.INTERVIEW_SCHEDULED
        );

        long selected = jobApplicationRepository.countByStatus(
                JobApplicationStatus.SELECTED
        );

        long rejected = jobApplicationRepository.countByStatus(
                JobApplicationStatus.REJECTED
        );

        long withdrawn = jobApplicationRepository.countByStatus(
                JobApplicationStatus.WITHDRAWN
        );

        long total = applied
                + underReview
                + shortlisted
                + interviewScheduled
                + selected
                + rejected
                + withdrawn;

        return new RecruitmentPipelineResponse(
                total,
                applied,
                underReview,
                shortlisted,
                interviewScheduled,
                selected,
                rejected,
                withdrawn
        );
    }

    public JobOpeningStatisticsResponse getJobOpeningStatistics() {

        long open = jobOpeningRepository.countByStatus(JobStatus.OPEN);
        long closed = jobOpeningRepository.countByStatus(JobStatus.CLOSED);
        long onHold = jobOpeningRepository.countByStatus(JobStatus.ON_HOLD);
        long cancelled = jobOpeningRepository.countByStatus(JobStatus.CANCELLED);

        long total = open + closed + onHold + cancelled;

        return new JobOpeningStatisticsResponse(
                total,
                open,
                closed,
                onHold,
                cancelled
        );
    }

    public InterviewStatisticsResponse getInterviewStatistics() {

        long scheduled = interviewRepository.countByStatus(
                InterviewStatus.SCHEDULED
        );

        long completed = interviewRepository.countByStatus(
                InterviewStatus.COMPLETED
        );

        long cancelled = interviewRepository.countByStatus(
                InterviewStatus.CANCELLED
        );

        long total = scheduled + completed + cancelled;

        return new InterviewStatisticsResponse(
                total,
                scheduled,
                completed,
                cancelled
        );
    }

    public CandidateSelectionStatisticsResponse getCandidateSelectionStatistics() {

        long totalCandidates = candidateRepository.count();

        long selected = jobApplicationRepository
                .countDistinctByCandidateIdAndStatusIn(
                        List.of(JobApplicationStatus.SELECTED)
                );

        long rejected = jobApplicationRepository
                .countDistinctByCandidateIdAndStatusIn(
                        List.of(JobApplicationStatus.REJECTED)
                );

        long inProgress = jobApplicationRepository
                .countDistinctByCandidateIdAndStatusIn(
                        List.of(
                                JobApplicationStatus.APPLIED,
                                JobApplicationStatus.UNDER_REVIEW,
                                JobApplicationStatus.SHORTLISTED,
                                JobApplicationStatus.INTERVIEW_SCHEDULED
                        )
                );

        return new CandidateSelectionStatisticsResponse(
                totalCandidates,
                selected,
                rejected,
                inProgress
        );
    }

    public List<DepartmentRecruitmentStatisticsResponse>
    getDepartmentRecruitmentStatistics() {

        return jobOpeningRepository.findDistinctDepartments()
                .stream()
                .map(department -> new DepartmentRecruitmentStatisticsResponse(
                        department,
                        jobOpeningRepository.countByDepartmentIgnoreCase(department),
                        jobApplicationRepository.countByJobOpeningDepartmentIgnoreCase(department),
                        jobApplicationRepository.countByJobOpeningDepartmentIgnoreCaseAndStatus(
                                department,
                                JobApplicationStatus.SELECTED
                        ),
                        jobApplicationRepository.countByJobOpeningDepartmentIgnoreCaseAndStatus(
                                department,
                                JobApplicationStatus.REJECTED
                        )
                ))
                .toList();
    }
}
