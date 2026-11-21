package com.intellihr.recruitment.service;

import com.intellihr.recruitment.dto.JobOpeningRequest;
import com.intellihr.recruitment.dto.JobOpeningResponse;
import com.intellihr.recruitment.entity.JobStatus;

import java.util.List;

public interface JobOpeningService {

    JobOpeningResponse createJobOpening(JobOpeningRequest request);

    List<JobOpeningResponse> getAllJobOpenings();

    List<JobOpeningResponse> getPublicJobOpenings();

    JobOpeningResponse getJobOpeningById(Long id);

    List<JobOpeningResponse> getJobsByDepartment(String department);

    List<JobOpeningResponse> getJobsByStatus(JobStatus status);

    List<JobOpeningResponse> searchJobsByTitle(String title);

    JobOpeningResponse updateJobOpening(Long id, JobOpeningRequest request);

    JobOpeningResponse updateJobStatus(Long id, JobStatus status);

    void deleteJobOpening(Long id);
}

