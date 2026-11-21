package com.intellihr.recruitment.interview.dto;

import com.intellihr.recruitment.interview.entity.InterviewMode;
import com.intellihr.recruitment.interview.entity.InterviewRound;
import com.intellihr.recruitment.interview.entity.InterviewStatus;

import java.time.LocalDateTime;

public record InterviewResponse(
        Long id,
        Long jobApplicationId,
        String candidateName,
        String candidateEmail,
        String jobTitle,
        Long interviewerId,
        String interviewerName,
        String interviewerEmail,
        InterviewRound round,
        LocalDateTime scheduledAt,
        Integer durationMinutes,
        InterviewMode mode,
        String meetingLink,
        String location,
        String notes,
        InterviewStatus status,
        String cancellationReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
