package com.intellihr.attendance.dto;

import com.intellihr.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequest(

        @NotNull(message = "Employee ID is required")
        Long employeeId,

        @NotNull(message = "Attendance date is required")
        LocalDate attendanceDate,

        LocalTime checkInTime,

        LocalTime checkOutTime,

        @NotNull(message = "Attendance status is required")
        AttendanceStatus status,

        @Size(max = 500, message = "Remarks cannot exceed 500 characters")
        String remarks

) {}
