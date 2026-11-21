package com.intellihr.attendance.dto;

import com.intellihr.attendance.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceResponse(

        Long id,
        Long employeeId,
        String employeeName,
        LocalDate attendanceDate,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        AttendanceStatus status,
        String remarks,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
