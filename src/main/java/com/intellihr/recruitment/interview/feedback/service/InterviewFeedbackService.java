package com.intellihr.recruitment.interview.feedback.service;

import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackRequest;
import com.intellihr.recruitment.interview.feedback.dto.InterviewFeedbackResponse;

import java.util.List;

public interface InterviewFeedbackService {

    InterviewFeedbackResponse submitFeedback(
            Long interviewId,
            InterviewFeedbackRequest request
    );

    InterviewFeedbackResponse getFeedbackByInterview(Long interviewId);

    List<InterviewFeedbackResponse> getAllFeedback();
}
