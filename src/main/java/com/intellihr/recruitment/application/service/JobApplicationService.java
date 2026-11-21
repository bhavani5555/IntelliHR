package com.intellihr.recruitment.application.service;

import com.intellihr.recruitment.application.dto.JobApplicationRequest;
import com.intellihr.recruitment.application.dto.CandidateJobApplicationRequest;
import com.intellihr.recruitment.application.dto.JobApplicationResponse;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;

import java.util.List;
import org.springframework.core.io.Resource;

public interface JobApplicationService {

    JobApplicationResponse applyForJob(JobApplicationRequest request);

    JobApplicationResponse applyForJobAsCandidate(
            String email,
            CandidateJobApplicationRequest request
    );

    List<JobApplicationResponse> getAllApplications();

    JobApplicationResponse getApplicationById(Long id);

    List<JobApplicationResponse> getApplicationsByCandidate(Long candidateId);

    List<JobApplicationResponse> getMyApplications(String email);

    List<JobApplicationResponse> getApplicationsByJobOpening(Long jobOpeningId);

    List<JobApplicationResponse> getApplicationsByStatus(JobApplicationStatus status);

    JobApplicationResponse updateApplicationStatus(
            Long id,
            JobApplicationStatus status
    );

    Resource getApplicationResume(Long id);

    void deleteApplication(Long id);
}


