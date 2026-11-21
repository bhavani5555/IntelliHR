package com.intellihr.leave.dto;

import com.intellihr.leave.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LeaveReviewRequest(

        @NotNull(message = "Leave status is required")
        LeaveStatus status,

        @Size(max = 500, message = "Reviewer remarks cannot exceed 500 characters")
        String reviewerRemarks

) {}
