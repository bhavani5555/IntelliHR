package com.intellihr.leave.dto;

import com.intellihr.leave.entity.LeaveType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record LeaveRequest(

        Long employeeId,

        @NotNull(message = "Leave type is required")
        LeaveType leaveType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotBlank(message = "Leave reason is required")
        @Size(max = 500, message = "Reason cannot exceed 500 characters")
        String reason

) {}