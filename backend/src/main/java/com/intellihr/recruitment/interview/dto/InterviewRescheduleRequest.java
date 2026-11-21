package com.intellihr.recruitment.interview.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record InterviewRescheduleRequest(

        @NotNull(message = "New interview date and time are required")
        @Future(message = "New interview date must be in the future")
        LocalDateTime scheduledAt,

        @NotNull(message = "Interview duration is required")
        @Min(value = 15, message = "Interview duration must be at least 15 minutes")
        @Max(value = 480, message = "Interview duration cannot exceed 480 minutes")
        Integer durationMinutes,

        @Size(max = 500, message = "Meeting link cannot exceed 500 characters")
        String meetingLink,

        @Size(max = 255, message = "Location cannot exceed 255 characters")
        String location,

        @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
        String notes

) {
}
