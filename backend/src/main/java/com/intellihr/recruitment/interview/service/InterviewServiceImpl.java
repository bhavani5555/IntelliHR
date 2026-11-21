package com.intellihr.recruitment.interview.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.entity.NotificationType;
import com.intellihr.notification.service.NotificationService;

import com.intellihr.recruitment.application.entity.JobApplication;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;

import com.intellihr.recruitment.interview.dto.InterviewRequest;
import com.intellihr.recruitment.interview.dto.InterviewResponse;
import com.intellihr.recruitment.interview.dto.InterviewRescheduleRequest;
import com.intellihr.recruitment.interview.dto.InterviewStatusUpdateRequest;
import com.intellihr.recruitment.interview.entity.Interview;
import com.intellihr.recruitment.interview.entity.InterviewMode;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.repository.InterviewRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public InterviewServiceImpl(
            InterviewRepository interviewRepository,
            JobApplicationRepository applicationRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService
    ) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public InterviewResponse scheduleInterview(InterviewRequest request) {

        JobApplication application = applicationRepository
                .findById(request.jobApplicationId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Job application not found"
                ));

        if (application.getStatus() != JobApplicationStatus.SHORTLISTED
                && application.getStatus()
                != JobApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only shortlisted applications can be scheduled for interview"
            );
        }

        Employee interviewer = employeeRepository
                .findById(request.interviewerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Interviewer not found"
                ));

        if (!interviewer.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Inactive employees cannot be assigned as interviewers"
            );
        }

        validateInterviewMode(
                request.mode(),
                request.meetingLink(),
                request.location()
        );

        validateNoSchedulingConflict(
                interviewer.getId(),
                request.scheduledAt(),
                request.durationMinutes(),
                null
        );

        Interview interview = new Interview();
        interview.setJobApplication(application);
        interview.setInterviewer(interviewer);
        interview.setRound(request.round());
        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setMode(request.mode());
        interview.setMeetingLink(request.meetingLink());
        interview.setLocation(request.location());
        interview.setNotes(request.notes());
        interview.setStatus(InterviewStatus.SCHEDULED);

        if (application.getStatus() == JobApplicationStatus.SHORTLISTED) {
            application.setStatus(JobApplicationStatus.INTERVIEW_SCHEDULED);
            applicationRepository.save(application);
        }

        Interview savedInterview = interviewRepository.saveAndFlush(interview);

        sendInterviewerNotification(
                savedInterview,
                "Interview Scheduled",
                "An interview has been scheduled for you."
        );

        return mapToResponse(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getAllInterviews() {
        return interviewRepository.findAllByOrderByScheduledAtAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getMyInterviews() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Authenticated user is not linked to an employee"
                ));

        return interviewRepository
                .findByInterviewerIdOrderByScheduledAtAsc(employee.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getInterviewById(Long id) {
        return mapToResponse(findInterview(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByApplication(
            Long jobApplicationId
    ) {
        if (!applicationRepository.existsById(jobApplicationId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Job application not found"
            );
        }

        return interviewRepository
                .findByJobApplicationIdOrderByScheduledAtAsc(jobApplicationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByInterviewer(Long interviewerId) {

        if (!employeeRepository.existsById(interviewerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Interviewer not found"
            );
        }

        return interviewRepository
                .findByInterviewerIdOrderByScheduledAtAsc(interviewerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByStatus(
            InterviewStatus status
    ) {
        return interviewRepository.findByStatusOrderByScheduledAtAsc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public InterviewResponse rescheduleInterview(
            Long id,
            InterviewRescheduleRequest request
    ) {
        Interview interview = findInterview(id);

        if (interview.getStatus() != InterviewStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only scheduled interviews can be rescheduled"
            );
        }

        String meetingLink = request.meetingLink() != null
                ? request.meetingLink() : interview.getMeetingLink();

        String location = request.location() != null
                ? request.location() : interview.getLocation();

        String notes = request.notes() != null
                ? request.notes() : interview.getNotes();

        validateInterviewMode(interview.getMode(), meetingLink, location);

        validateNoSchedulingConflict(
                interview.getInterviewer().getId(),
                request.scheduledAt(),
                request.durationMinutes(),
                interview.getId()
        );

        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setMeetingLink(meetingLink);
        interview.setLocation(location);
        interview.setNotes(notes);

        Interview savedInterview = interviewRepository.saveAndFlush(interview);

        sendInterviewerNotification(
                savedInterview,
                "Interview Rescheduled",
                "Your interview schedule has been changed."
        );

        return mapToResponse(savedInterview);
    }

    @Override
    public InterviewResponse updateInterviewStatus(
            Long id,
            InterviewStatusUpdateRequest request
    ) {
        Interview interview = findInterview(id);

        if (request.status() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Interview status is required"
            );
        }

        if (interview.getStatus() != InterviewStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Completed or cancelled interviews cannot be modified"
            );
        }

        if (request.status() == InterviewStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Interview status cannot be reset to SCHEDULED"
            );
        }

        if (request.status() == InterviewStatus.CANCELLED
                && (request.cancellationReason() == null
                || request.cancellationReason().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancellation reason is required"
            );
        }

        interview.setStatus(request.status());

        if (request.status() == InterviewStatus.CANCELLED) {
            interview.setCancellationReason(
                    request.cancellationReason().trim()
            );
        }

        Interview savedInterview = interviewRepository.saveAndFlush(interview);

        if (request.status() == InterviewStatus.CANCELLED) {
            sendInterviewerNotification(
                    savedInterview,
                    "Interview Cancelled",
                    "Your interview has been cancelled. Reason: "
                            + savedInterview.getCancellationReason()
            );
        }

        return mapToResponse(savedInterview);
    }

    @Override
    public void deleteInterview(Long id) {
        Interview interview = findInterview(id);

        if (interview.getStatus() != InterviewStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only scheduled interviews can be deleted"
            );
        }

        interviewRepository.delete(interview);
    }

    private void sendInterviewerNotification(
            Interview interview,
            String title,
            String eventMessage
    ) {
        JobApplication application = interview.getJobApplication();

        String candidateName =
                application.getCandidate().getFirstName()
                + " "
                + application.getCandidate().getLastName();

        String jobTitle = application.getJobOpening().getTitle();

        String message = eventMessage
                + " Candidate: " + candidateName + "."
                + " Position: " + jobTitle + "."
                + " Round: " + interview.getRound() + "."
                + " Date and time: " + interview.getScheduledAt() + "."
                + " Duration: " + interview.getDurationMinutes() + " minutes."
                + " Mode: " + interview.getMode() + ".";

        if (interview.getMode() == InterviewMode.ONLINE
                && interview.getMeetingLink() != null) {
            message += " Meeting link: " + interview.getMeetingLink() + ".";
        }

        if (interview.getMode() == InterviewMode.IN_PERSON
                && interview.getLocation() != null) {
            message += " Location: " + interview.getLocation() + ".";
        }

        notificationService.createNotification(
                new NotificationRequest(
                        interview.getInterviewer().getEmail(),
                        title,
                        message,
                        NotificationType.INTERVIEW
                )
        );
    }

    private void validateInterviewMode(
            InterviewMode mode,
            String meetingLink,
            String location
    ) {
        if (mode == InterviewMode.ONLINE
                && (meetingLink == null || meetingLink.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Meeting link is required for online interviews"
            );
        }

        if (mode == InterviewMode.IN_PERSON
                && (location == null || location.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Location is required for in-person interviews"
            );
        }
    }

    private void validateNoSchedulingConflict(
            Long interviewerId,
            LocalDateTime newStart,
            Integer newDuration,
            Long excludedInterviewId
    ) {
        LocalDateTime newEnd = newStart.plusMinutes(newDuration);

        List<Interview> scheduledInterviews =
                interviewRepository.findByInterviewerIdAndStatusOrderByScheduledAtAsc(
                        interviewerId,
                        InterviewStatus.SCHEDULED
                );

        for (Interview existing : scheduledInterviews) {

            if (excludedInterviewId != null
                    && existing.getId().equals(excludedInterviewId)) {
                continue;
            }

            LocalDateTime existingStart = existing.getScheduledAt();
            LocalDateTime existingEnd = existingStart.plusMinutes(
                    existing.getDurationMinutes()
            );

            boolean overlaps = newStart.isBefore(existingEnd)
                    && newEnd.isAfter(existingStart);

            if (overlaps) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Interviewer already has an interview scheduled during this time"
                );
            }
        }
    }

    private Interview findInterview(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Interview not found"
                ));
    }

    private InterviewResponse mapToResponse(Interview interview) {

        JobApplication application = interview.getJobApplication();
        Employee interviewer = interview.getInterviewer();

        String candidateName =
                application.getCandidate().getFirstName()
                + " "
                + application.getCandidate().getLastName();

        return new InterviewResponse(
                interview.getId(),
                application.getId(),
                candidateName,
                application.getCandidate().getEmail(),
                application.getJobOpening().getTitle(),
                interviewer.getId(),
                interviewer.getFirstName() + " " + interviewer.getLastName(),
                interviewer.getEmail(),
                interview.getRound(),
                interview.getScheduledAt(),
                interview.getDurationMinutes(),
                interview.getMode(),
                interview.getMeetingLink(),
                interview.getLocation(),
                interview.getNotes(),
                interview.getStatus(),
                interview.getCancellationReason(),
                interview.getCreatedAt(),
                interview.getUpdatedAt()
        );
    }
}
