package com.intellihr.recruitment.application.service;

import com.intellihr.recruitment.application.dto.JobApplicationRequest;
import com.intellihr.recruitment.application.dto.CandidateJobApplicationRequest;
import com.intellihr.recruitment.application.dto.JobApplicationResponse;
import com.intellihr.recruitment.application.entity.JobApplication;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.entity.NotificationType;
import com.intellihr.notification.service.NotificationService;
import com.intellihr.recruitment.candidate.entity.Candidate;
import com.intellihr.recruitment.candidate.repository.CandidateRepository;
import com.intellihr.recruitment.candidate.service.ResumeStorageService;
import org.springframework.core.io.Resource;
import com.intellihr.recruitment.entity.JobOpening;
import com.intellihr.recruitment.entity.JobStatus;
import com.intellihr.recruitment.repository.JobOpeningRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final ResumeStorageService resumeStorageService;
    private final NotificationService notificationService;

    public JobApplicationServiceImpl(
            JobApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            JobOpeningRepository jobOpeningRepository,
            ResumeStorageService resumeStorageService,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobOpeningRepository = jobOpeningRepository;
        this.resumeStorageService = resumeStorageService;
        this.notificationService = notificationService;
    }

    @Override
    public JobApplicationResponse applyForJob(JobApplicationRequest request) {

        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Candidate not found"
                ));

        JobOpening jobOpening = jobOpeningRepository.findById(request.jobOpeningId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Job opening not found"
                ));

        if (applicationRepository.existsByCandidateIdAndJobOpeningId(
                candidate.getId(), jobOpening.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Candidate has already applied for this job"
            );
        }

        if (jobOpening.getStatus() != JobStatus.OPEN) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Applications are not accepted for this job"
            );
        }

        if (jobOpening.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Application deadline has passed"
            );
        }

        JobApplication application = new JobApplication();
        application.setCandidate(candidate);
        application.setJobOpening(jobOpening);
        application.setStatus(JobApplicationStatus.APPLIED);
        application.setCoverLetter(request.coverLetter());

        return mapToResponse(applicationRepository.save(application));
    }

    @Override
    public JobApplicationResponse applyForJobAsCandidate(
            String email,
            CandidateJobApplicationRequest request
    ) {

        Candidate candidate = candidateRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate profile not found"
                ));

        if (candidate.getResumeFileName() == null
                || candidate.getResumeFileName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please upload your resume before applying for a job"
            );
        }

        JobApplicationRequest applicationRequest = new JobApplicationRequest(
                candidate.getId(),
                request.jobOpeningId(),
                request.coverLetter()
        );

        return applyForJob(applicationRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(Long id) {
        return mapToResponse(findApplication(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByCandidate(Long candidateId) {

        if (!candidateRepository.existsById(candidateId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Candidate not found"
            );
        }

        return applicationRepository.findByCandidateId(candidateId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getMyApplications(String email) {

        Candidate candidate = candidateRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate profile not found"
                ));

        return applicationRepository.findByCandidateId(candidate.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByJobOpening(Long jobOpeningId) {

        if (!jobOpeningRepository.existsById(jobOpeningId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Job opening not found"
            );
        }

        return applicationRepository.findByJobOpeningId(jobOpeningId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByStatus(
            JobApplicationStatus status
    ) {
        return applicationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public JobApplicationResponse updateApplicationStatus(
            Long id,
            JobApplicationStatus status
    ) {

        JobApplication application = findApplication(id);

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Application status is required"
            );
        }

        JobApplicationStatus currentStatus = application.getStatus();

        if (currentStatus == status) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Application already has this status"
            );
        }

        if (!isValidTransition(currentStatus, status)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid application status transition from "
                            + currentStatus + " to " + status
            );
        }

        application.setStatus(status);

        JobApplication savedApplication =
                applicationRepository.saveAndFlush(application);

        if (status == JobApplicationStatus.SHORTLISTED
                || status == JobApplicationStatus.REJECTED
                || status == JobApplicationStatus.SELECTED) {

            String notificationTitle = switch (status) {
                case SHORTLISTED -> "Application Shortlisted";
                case REJECTED -> "Application Update";
                case SELECTED -> "Congratulations!";
                default -> "Application Update";
            };

            String notificationMessage = switch (status) {
                case SHORTLISTED -> "Your application for "
                        + savedApplication.getJobOpening().getTitle()
                        + " has been shortlisted.";
                case REJECTED -> "Your application for "
                        + savedApplication.getJobOpening().getTitle()
                        + " was not selected.";
                case SELECTED -> "Your application for "
                        + savedApplication.getJobOpening().getTitle()
                        + " has been accepted.";
                default -> "Your application status has been updated.";
            };

            notificationService.createNotification(
                    new NotificationRequest(
                            savedApplication.getCandidate().getEmail(),
                            notificationTitle,
                            notificationMessage,
                            NotificationType.RECRUITMENT
                    )
            );
        }

        return mapToResponse(savedApplication);
    }


    @Override
    @Transactional(readOnly = true)
    public Resource getApplicationResume(Long id) {

        JobApplication application = findApplication(id);

        String resumeFileName = application.getCandidate().getResumeFileName();

        if (resumeFileName == null || resumeFileName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Candidate resume not found"
            );
        }

        return resumeStorageService.loadResume(resumeFileName);
    }
    private boolean isValidTransition(
            JobApplicationStatus currentStatus,
            JobApplicationStatus newStatus
    ) {
        return switch (currentStatus) {
            case APPLIED -> Set.of(
                    JobApplicationStatus.UNDER_REVIEW,
                    JobApplicationStatus.REJECTED,
                    JobApplicationStatus.WITHDRAWN
            ).contains(newStatus);

            case UNDER_REVIEW -> Set.of(
                    JobApplicationStatus.SHORTLISTED,
                    JobApplicationStatus.REJECTED,
                    JobApplicationStatus.WITHDRAWN
            ).contains(newStatus);

            case SHORTLISTED -> Set.of(
                    JobApplicationStatus.INTERVIEW_SCHEDULED,
                    JobApplicationStatus.REJECTED,
                    JobApplicationStatus.WITHDRAWN
            ).contains(newStatus);

            case INTERVIEW_SCHEDULED -> Set.of(
                    JobApplicationStatus.SELECTED,
                    JobApplicationStatus.REJECTED,
                    JobApplicationStatus.WITHDRAWN
            ).contains(newStatus);

            case SELECTED, REJECTED, WITHDRAWN -> false;
        };
    }

    @Override
    public void deleteApplication(Long id) {
        JobApplication application = findApplication(id);
        applicationRepository.delete(application);
    }

    private JobApplication findApplication(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Job application not found"
                ));
    }

    private JobApplicationResponse mapToResponse(JobApplication application) {

        Candidate candidate = application.getCandidate();
        JobOpening jobOpening = application.getJobOpening();

        return new JobApplicationResponse(
                application.getId(),
                candidate.getId(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                candidate.getEmail(),
                candidate.getPhoneNumber(),
                candidate.getCurrentLocation(),
                candidate.getYearsOfExperience(),
                candidate.getSkills(),
                candidate.getHighestQualification(),
                candidate.getResumeFileName(),
                jobOpening.getId(),
                jobOpening.getTitle(),
                jobOpening.getDepartment(),
                application.getStatus(),
                application.getCoverLetter(),
                application.getAppliedAt(),
                application.getUpdatedAt()
        );
    }
}





