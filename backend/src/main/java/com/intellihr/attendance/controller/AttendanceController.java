package com.intellihr.attendance.controller;

import com.intellihr.attendance.dto.AttendanceRequest;
import com.intellihr.attendance.dto.AttendanceResponse;
import com.intellihr.attendance.service.AttendanceService;
import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeRepository employeeRepository;

    public AttendanceController(
            AttendanceService attendanceService,
            EmployeeRepository employeeRepository
    ) {
        this.attendanceService = attendanceService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkIn(
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.checkIn(authentication.getName()));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkOut(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attendanceService.checkOut(authentication.getName())
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AttendanceResponse> createAttendance(
            @Valid @RequestBody AttendanceRequest request
    ) {
        AttendanceResponse response =
                attendanceService.createAttendance(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AttendanceResponse> getAttendanceById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        checkEmployeeOwnership(employeeId, authentication);

        return ResponseEntity.ok(
                attendanceService.getEmployeeAttendance(employeeId)
        );
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByDate(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request
    ) {
        return ResponseEntity.ok(
                attendanceService.updateAttendance(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(
            @PathVariable Long id
    ) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    private void checkEmployeeOwnership(
            Long employeeId,
            Authentication authentication
    ) {
        boolean privileged = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_HR")
                );

        if (privileged) {
            return;
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (!employee.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can access only your own attendance records"
            );
        }
    }
}