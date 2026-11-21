package com.intellihr.recruitment.interview.dto;

import com.intellihr.recruitment.interview.entity.InterviewMode;
import com.intellihr.recruitment.interview.entity.InterviewRound;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record InterviewRequest(

        @NotNull(message = "Job application ID is required")
        Long jobApplicationId,

        @NotNull(message = "Interviewer ID is required")
        Long interviewerId,

        @NotNull(message = "Interview round is required")
        InterviewRound round,

        @NotNull(message = "Interview date and time are required")
        @Future(message = "Interview must be scheduled in the future")
        LocalDateTime scheduledAt,

        @NotNull(message = "Interview duration is required")
        @Min(value = 15, message = "Interview duration must be at least 15 minutes")
        @Max(value = 480, message = "Interview duration cannot exceed 480 minutes")
        Integer durationMinutes,

        @NotNull(message = "Interview mode is required")
        InterviewMode mode,

        @Size(max = 500, message = "Meeting link cannot exceed 500 characters")
        String meetingLink,

        @Size(max = 255, message = "Location cannot exceed 255 characters")
        String location,

        @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
        String notes

) {
}
