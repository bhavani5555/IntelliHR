package com.intellihr.recruitment.interview.service;

import com.intellihr.recruitment.interview.dto.InterviewRequest;
import com.intellihr.recruitment.interview.dto.InterviewResponse;
import com.intellihr.recruitment.interview.dto.InterviewRescheduleRequest;
import com.intellihr.recruitment.interview.dto.InterviewStatusUpdateRequest;
import com.intellihr.recruitment.interview.entity.InterviewStatus;

import java.util.List;

public interface InterviewService {

    InterviewResponse scheduleInterview(InterviewRequest request);

    List<InterviewResponse> getAllInterviews();

    List<InterviewResponse> getMyInterviews();

    InterviewResponse getInterviewById(Long id);

    List<InterviewResponse> getInterviewsByApplication(Long jobApplicationId);

    List<InterviewResponse> getInterviewsByInterviewer(Long interviewerId);

    List<InterviewResponse> getInterviewsByStatus(InterviewStatus status);

    InterviewResponse rescheduleInterview(
            Long id,
            InterviewRescheduleRequest request
    );

    InterviewResponse updateInterviewStatus(
            Long id,
            InterviewStatusUpdateRequest request
    );

    void deleteInterview(Long id);
}
