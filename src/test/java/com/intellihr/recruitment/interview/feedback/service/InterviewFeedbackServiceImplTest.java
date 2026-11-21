package com.intellihr.recruitment.interview.feedback.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.recruitment.interview.entity.Interview;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackRequest;
import com.intellihr.recruitment.interview.feedback.entity.InterviewRecommendation;
import com.intellihr.recruitment.interview.feedback.repository.InterviewFeedbackRepository;
import com.intellihr.recruitment.interview.repository.InterviewRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewFeedbackServiceImplTest {

    @Mock
    private InterviewFeedbackRepository feedbackRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private InterviewFeedbackServiceImpl feedbackService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void submitFeedbackShouldRejectIncompleteInterview() {

        Interview interview = new Interview();
        interview.setStatus(InterviewStatus.SCHEDULED);

        when(interviewRepository.findById(5L))
                .thenReturn(Optional.of(interview));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> feedbackService.submitFeedback(5L, createRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void submitFeedbackShouldRejectUnassignedInterviewer() {

        Interview interview = new Interview();
        interview.setStatus(InterviewStatus.COMPLETED);

        Employee assignedInterviewer = new Employee();
        assignedInterviewer.setId(10L);
        interview.setInterviewer(assignedInterviewer);

        Employee authenticatedEmployee = new Employee();
        authenticatedEmployee.setId(11L);

        setAuthenticatedUser();

        when(interviewRepository.findById(5L))
                .thenReturn(Optional.of(interview));

        when(employeeRepository.findByEmail("interviewer@example.com"))
                .thenReturn(Optional.of(authenticatedEmployee));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> feedbackService.submitFeedback(5L, createRequest())
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void submitFeedbackShouldRejectDuplicateFeedback() {

        Interview interview = new Interview();
        interview.setStatus(InterviewStatus.COMPLETED);

        Employee assignedInterviewer = new Employee();
        assignedInterviewer.setId(10L);
        interview.setInterviewer(assignedInterviewer);

        Employee authenticatedEmployee = new Employee();
        authenticatedEmployee.setId(10L);

        setAuthenticatedUser();

        when(interviewRepository.findById(5L))
                .thenReturn(Optional.of(interview));

        when(employeeRepository.findByEmail("interviewer@example.com"))
                .thenReturn(Optional.of(authenticatedEmployee));

        when(feedbackRepository.existsByInterviewId(5L))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> feedbackService.submitFeedback(5L, createRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    private void setAuthenticatedUser() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "interviewer@example.com",
                        "password",
                        List.of()
                )
        );
    }

    private InterviewFeedbackRequest createRequest() {
        return new InterviewFeedbackRequest(
                4,
                5,
                4,
                "Strong technical knowledge",
                "Needs improvement in communication",
                "Overall good interview",
                InterviewRecommendation.SELECTED
        );
    }
}