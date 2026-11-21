package com.intellihr.recruitment.interview.feedback.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.recruitment.interview.entity.Interview;
import com.intellihr.recruitment.interview.entity.InterviewStatus;
import com.intellihr.recruitment.interview.repository.InterviewRepository;
import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackRequest;
import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackResponse;
import com.intellihr.recruitment.interview.feedback.entity.InterviewFeedback;
import com.intellihr.recruitment.interview.feedback.repository.InterviewFeedbackRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class InterviewFeedbackServiceImpl
        implements InterviewFeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final InterviewRepository interviewRepository;
    private final EmployeeRepository employeeRepository;

    public InterviewFeedbackServiceImpl(
            InterviewFeedbackRepository feedbackRepository,
            InterviewRepository interviewRepository,
            EmployeeRepository employeeRepository
    ) {
        this.feedbackRepository = feedbackRepository;
        this.interviewRepository = interviewRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public InterviewFeedbackResponse submitFeedback(
            Long interviewId,
            InterviewFeedbackRequest request
    ) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Interview not found"
                ));

        if (interview.getStatus() != InterviewStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Feedback can only be submitted for completed interviews"
            );
        }

        String authenticatedEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Employee authenticatedEmployee = employeeRepository
                .findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Authenticated user is not linked to an employee"
                ));

        if (!interview.getInterviewer().getId()
                .equals(authenticatedEmployee.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the assigned interviewer can submit feedback"
            );
        }

        if (feedbackRepository.existsByInterviewId(interviewId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Feedback has already been submitted for this interview"
            );
        }

        InterviewFeedback feedback = new InterviewFeedback();
        feedback.setInterview(interview);
        feedback.setTechnicalRating(request.technicalRating());
        feedback.setCommunicationRating(request.communicationRating());
        feedback.setProblemSolvingRating(request.problemSolvingRating());
        feedback.setStrengths(request.strengths().trim());
        feedback.setAreasForImprovement(
                request.areasForImprovement().trim()
        );
        feedback.setComments(request.comments().trim());
        feedback.setRecommendation(request.recommendation());

        return mapToResponse(feedbackRepository.saveAndFlush(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewFeedbackResponse getFeedbackByInterview(
            Long interviewId
    ) {

        if (!interviewRepository.existsById(interviewId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Interview not found"
            );
        }

        InterviewFeedback feedback = feedbackRepository
                .findByInterviewId(interviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Feedback not found for this interview"
                ));

        return mapToResponse(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewFeedbackResponse> getAllFeedback() {

        return feedbackRepository.findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InterviewFeedbackResponse mapToResponse(
            InterviewFeedback feedback
    ) {

        Interview interview = feedback.getInterview();

        String candidateName =
                interview.getJobApplication().getCandidate().getFirstName()
                + " "
                + interview.getJobApplication().getCandidate().getLastName();

        return new InterviewFeedbackResponse(
                feedback.getId(),
                interview.getId(),
                interview.getJobApplication().getId(),
                candidateName,
                interview.getJobApplication().getCandidate().getEmail(),
                interview.getJobApplication().getJobOpening().getTitle(),
                interview.getInterviewer().getId(),
                interview.getInterviewer().getFirstName()
                        + " "
                        + interview.getInterviewer().getLastName(),
                feedback.getTechnicalRating(),
                feedback.getCommunicationRating(),
                feedback.getProblemSolvingRating(),
                feedback.getStrengths(),
                feedback.getAreasForImprovement(),
                feedback.getComments(),
                feedback.getRecommendation(),
                feedback.getSubmittedAt()
        );
    }
}
