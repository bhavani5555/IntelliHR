package com.intellihr.recruitment.interview.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.notification.service.NotificationService;
import com.intellihr.recruitment.application.entity.JobApplication;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;
import com.intellihr.recruitment.interview.dto.InterviewRequest;
import com.intellihr.recruitment.interview.dto.InterviewStatusUpdateRequest;
import com.intellihr.recruitment.interview.entity.Interview;
import com.intellihr.recruitment.interview.entity.InterviewMode;
import com.intellihr.recruitment.interview.entity.InterviewRound;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.repository.InterviewRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InterviewServiceImpl interviewService;

    @Test
    void scheduleInterviewShouldRejectApplicationNotShortlisted() {

        JobApplication application = new JobApplication();
        application.setStatus(JobApplicationStatus.APPLIED);

        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(application));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interviewService.scheduleInterview(createRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void scheduleInterviewShouldRejectInactiveInterviewer() {

        JobApplication application = new JobApplication();
        application.setStatus(JobApplicationStatus.SHORTLISTED);

        Employee interviewer = new Employee();
        interviewer.setId(10L);
        interviewer.setActive(false);

        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(application));

        when(employeeRepository.findById(10L))
                .thenReturn(Optional.of(interviewer));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interviewService.scheduleInterview(createRequest())
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void scheduleInterviewShouldRejectSchedulingConflict() {

        LocalDateTime scheduledAt = LocalDateTime.now().plusDays(2);

        JobApplication application = new JobApplication();
        application.setStatus(JobApplicationStatus.SHORTLISTED);

        Employee interviewer = new Employee();
        interviewer.setId(10L);
        interviewer.setActive(true);

        Interview existingInterview = new Interview();
        existingInterview.setScheduledAt(scheduledAt.minusMinutes(30));
        existingInterview.setDurationMinutes(60);
        existingInterview.setStatus(InterviewStatus.SCHEDULED);

        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(application));

        when(employeeRepository.findById(10L))
                .thenReturn(Optional.of(interviewer));

        when(interviewRepository.findByInterviewerIdAndStatusOrderByScheduledAtAsc(
                10L, InterviewStatus.SCHEDULED
        )).thenReturn(List.of(existingInterview));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interviewService.scheduleInterview(
                        createRequest(scheduledAt)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void cancelInterviewShouldRequireCancellationReason() {

        Interview interview = new Interview();
        interview.setId(5L);
        interview.setStatus(InterviewStatus.SCHEDULED);

        when(interviewRepository.findById(5L))
                .thenReturn(Optional.of(interview));

        InterviewStatusUpdateRequest request =
                new InterviewStatusUpdateRequest(
                        InterviewStatus.CANCELLED,
                        null
                );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interviewService.updateInterviewStatus(5L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    private InterviewRequest createRequest() {
        return createRequest(LocalDateTime.now().plusDays(2));
    }

    private InterviewRequest createRequest(LocalDateTime scheduledAt) {

        return new InterviewRequest(
                1L,
                10L,
                InterviewRound.TECHNICAL,
                scheduledAt,
                60,
                InterviewMode.ONLINE,
                "https://example.com/meeting",
                null,
                "Technical interview"
        );
    }
}
