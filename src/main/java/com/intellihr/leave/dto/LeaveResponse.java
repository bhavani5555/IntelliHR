package com.intellihr.leave.dto;

import com.intellihr.leave.entity.LeaveStatus;
import com.intellihr.leave.entity.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveResponse(

        Long id,
        Long employeeId,
        String employeeName,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        LeaveStatus status,
        String reviewerRemarks,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
