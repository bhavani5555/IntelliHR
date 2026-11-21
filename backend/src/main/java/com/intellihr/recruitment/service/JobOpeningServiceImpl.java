package com.intellihr.recruitment.service;

import com.intellihr.recruitment.application.repository.JobApplicationRepository;
import com.intellihr.recruitment.dto.JobOpeningRequest;
import com.intellihr.recruitment.dto.JobOpeningResponse;
import com.intellihr.recruitment.entity.JobOpening;
import com.intellihr.recruitment.entity.JobStatus;
import com.intellihr.recruitment.repository.JobOpeningRepository;

import jakarta.transaction.Transactional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class JobOpeningServiceImpl implements JobOpeningService {

    private final JobOpeningRepository jobOpeningRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public JobOpeningServiceImpl(
            JobOpeningRepository jobOpeningRepository,
            JobApplicationRepository jobApplicationRepository) {
        this.jobOpeningRepository = jobOpeningRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Override
    public JobOpeningResponse createJobOpening(JobOpeningRequest request) {
        validateSalaryRange(request);

        JobOpening job = new JobOpening();
        updateJobFields(job, request);
        job.setStatus(JobStatus.OPEN);

        return mapToResponse(jobOpeningRepository.save(job));
    }

    @Override
    public List<JobOpeningResponse> getAllJobOpenings() {
        return jobOpeningRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<JobOpeningResponse> getPublicJobOpenings() {
        return jobOpeningRepository
                .findByStatusAndApplicationDeadlineGreaterThanEqualOrderByCreatedAtDesc(
                        JobStatus.OPEN,
                        java.time.LocalDate.now()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public JobOpeningResponse getJobOpeningById(Long id) {
        return mapToResponse(findJobOpening(id));
    }

    @Override
    public List<JobOpeningResponse> getJobsByDepartment(String department) {
        return jobOpeningRepository.findByDepartmentIgnoreCase(department)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<JobOpeningResponse> getJobsByStatus(JobStatus status) {
        return jobOpeningRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<JobOpeningResponse> searchJobsByTitle(String title) {
        return jobOpeningRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public JobOpeningResponse updateJobOpening(
            Long id,
            JobOpeningRequest request) {

        validateSalaryRange(request);

        JobOpening job = findJobOpening(id);
        updateJobFields(job, request);

        return mapToResponse(jobOpeningRepository.save(job));
    }

    @Override
    public JobOpeningResponse updateJobStatus(Long id, JobStatus status) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Job status is required"
            );
        }

        JobOpening job = findJobOpening(id);
        JobStatus currentStatus = job.getStatus();

        if (currentStatus == status) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Job already has status: " + status
            );
        }

        boolean allowed = switch (currentStatus) {
            case OPEN -> status == JobStatus.ON_HOLD
                    || status == JobStatus.CLOSED
                    || status == JobStatus.CANCELLED;

            case ON_HOLD -> status == JobStatus.OPEN
                    || status == JobStatus.CLOSED
                    || status == JobStatus.CANCELLED;

            case CLOSED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot change job status from "
                            + currentStatus + " to " + status
            );
        }

        job.setStatus(status);

        return mapToResponse(jobOpeningRepository.save(job));
    }

    @Override
    public void deleteJobOpening(Long id) {
        JobOpening job = findJobOpening(id);

        if (jobApplicationRepository.existsByJobOpeningId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete this job opening because applications exist"
            );
        }

        try {
            jobOpeningRepository.delete(job);
            jobOpeningRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete this job opening because related records exist",
                    exception
            );
        }
    }

    private JobOpening findJobOpening(Long id) {
        return jobOpeningRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job opening not found with ID: " + id
                ));
    }

    private void validateSalaryRange(JobOpeningRequest request) {
        if (request.minimumSalary() != null
                && request.maximumSalary() != null
                && request.minimumSalary().compareTo(request.maximumSalary()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Minimum salary cannot exceed maximum salary"
            );
        }
    }

    private void updateJobFields(JobOpening job, JobOpeningRequest request) {
        job.setTitle(request.title().trim());
        job.setDepartment(request.department().trim());
        job.setDescription(request.description().trim());
        job.setRequiredSkills(request.requiredSkills());
        job.setNumberOfVacancies(request.numberOfVacancies());
        job.setEmploymentType(request.employmentType().trim());
        job.setLocation(request.location().trim());
        job.setMinimumSalary(request.minimumSalary());
        job.setMaximumSalary(request.maximumSalary());
        job.setApplicationDeadline(request.applicationDeadline());
    }

    private JobOpeningResponse mapToResponse(JobOpening job) {
        return new JobOpeningResponse(
                job.getId(),
                job.getTitle(),
                job.getDepartment(),
                job.getDescription(),
                job.getRequiredSkills(),
                job.getNumberOfVacancies(),
                job.getEmploymentType(),
                job.getLocation(),
                job.getMinimumSalary(),
                job.getMaximumSalary(),
                job.getApplicationDeadline(),
                job.getStatus(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
