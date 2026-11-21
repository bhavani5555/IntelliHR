package com.intellihr.attendance.service;

import com.intellihr.attendance.dto.AttendanceRequest;
import com.intellihr.attendance.dto.AttendanceResponse;
import com.intellihr.attendance.entity.Attendance;
import com.intellihr.attendance.entity.AttendanceStatus;
import com.intellihr.attendance.repository.AttendanceRepository;
import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public AttendanceResponse createAttendance(AttendanceRequest request) {

        validateRequest(request);

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(
                request.employeeId(),
                request.attendanceDate()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attendance already exists for this employee on this date"
            );
        }

        Employee employee = getEmployee(request.employeeId());

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(request.attendanceDate());
        attendance.setCheckInTime(request.checkInTime());
        attendance.setCheckOutTime(request.checkOutTime());
        attendance.setStatus(request.status());
        attendance.setRemarks(request.remarks());

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceResponse checkIn(String email) {

        Employee employee = getEmployeeByEmail(email);
        validateActiveEmployee(employee);

        LocalDate today = LocalDate.now();

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(
                employee.getId(),
                today
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already checked in today"
            );
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setCheckInTime(LocalTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT);

        try {
            return mapToResponse(attendanceRepository.saveAndFlush(attendance));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already checked in today"
            );
        }
    }

    @Override
    public AttendanceResponse checkOut(String email) {

        Employee employee = getEmployeeByEmail(email);
        validateActiveEmployee(employee);

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "You must check in before checking out"
                ));

        if (attendance.getCheckInTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You must check in before checking out"
            );
        }

        if (attendance.getCheckOutTime() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already checked out today"
            );
        }

        attendance.setCheckOutTime(LocalTime.now());

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {
        return mapToResponse(getAttendance(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEmployeeAttendance(Long employeeId) {

        getEmployee(employeeId);

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {

        if (date == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance date is required"
            );
        }

        return attendanceRepository.findByAttendanceDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AttendanceResponse updateAttendance(
            Long id,
            AttendanceRequest request
    ) {

        validateRequest(request);

        Attendance attendance = getAttendance(id);

        if (attendanceRepository
                .findByEmployeeIdAndAttendanceDate(
                        request.employeeId(),
                        request.attendanceDate()
                )
                .filter(existing -> !existing.getId().equals(id))
                .isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attendance already exists for this employee on this date"
            );
        }

        Employee employee = getEmployee(request.employeeId());

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(request.attendanceDate());
        attendance.setCheckInTime(request.checkInTime());
        attendance.setCheckOutTime(request.checkOutTime());
        attendance.setStatus(request.status());
        attendance.setRemarks(request.remarks());

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    public void deleteAttendance(Long id) {
        Attendance attendance = getAttendance(id);
        attendanceRepository.delete(attendance);
    }

    private Employee getEmployeeByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated employee email is required"
            );
        }

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No employee profile is linked to this login"
                ));
    }

    private void validateActiveEmployee(Employee employee) {

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Inactive employees cannot mark attendance"
            );
        }
    }

    private void validateRequest(AttendanceRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance request is required"
            );
        }

        if (request.attendanceDate() != null
                && request.attendanceDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Future attendance dates are not allowed"
            );
        }

        if (request.checkInTime() != null
                && request.checkOutTime() != null
                && request.checkOutTime().isBefore(request.checkInTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-out time cannot be before check-in time"
            );
        }
    }

    private Employee getEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));
    }

    private Attendance getAttendance(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attendance record not found"
                ));
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {

        Employee employee = attendance.getEmployee();

        return new AttendanceResponse(
                attendance.getId(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                attendance.getAttendanceDate(),
                attendance.getCheckInTime(),
                attendance.getCheckOutTime(),
                attendance.getStatus(),
                attendance.getRemarks(),
                attendance.getCreatedAt(),
                attendance.getUpdatedAt()
        );
    }
}