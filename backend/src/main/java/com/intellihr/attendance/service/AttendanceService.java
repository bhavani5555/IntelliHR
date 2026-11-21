package com.intellihr.attendance.service;

import com.intellihr.attendance.dto.AttendanceRequest;
import com.intellihr.attendance.dto.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponse createAttendance(AttendanceRequest request);

    AttendanceResponse checkIn(String email);

    AttendanceResponse checkOut(String email);

    List<AttendanceResponse> getAllAttendance();

    AttendanceResponse getAttendanceById(Long id);

    List<AttendanceResponse> getEmployeeAttendance(Long employeeId);

    List<AttendanceResponse> getAttendanceByDate(LocalDate date);

    AttendanceResponse updateAttendance(
            Long id,
            AttendanceRequest request
    );

    void deleteAttendance(Long id);
}