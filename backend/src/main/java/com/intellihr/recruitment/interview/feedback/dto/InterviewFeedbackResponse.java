package com.intellihr.recruitment.interview.feedback.dto;

import com.intellihr.recruitment.interview.feedback.entity.InterviewRecommendation;

import java.time.LocalDateTime;

public record InterviewFeedbackResponse(

        Long id,

        Long interviewId,

        Long jobApplicationId,

        String candidateName,

        String candidateEmail,

        String jobTitle,

        Long interviewerId,

        String interviewerName,

        Integer technicalRating,

        Integer communicationRating,

        Integer problemSolvingRating,

        String strengths,

        String areasForImprovement,

        String comments,

        InterviewRecommendation recommendation,

        LocalDateTime submittedAt

) {
}
