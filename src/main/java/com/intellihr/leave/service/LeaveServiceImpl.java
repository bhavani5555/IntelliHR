package com.intellihr.leave.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.leave.dto.LeaveRequest;
import com.intellihr.leave.dto.LeaveResponse;
import com.intellihr.leave.dto.LeaveReviewRequest;
import com.intellihr.leave.dto.LeaveBalanceResponse;
import com.intellihr.leave.entity.LeaveType;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import com.intellihr.leave.entity.Leave;
import com.intellihr.leave.entity.LeaveStatus;
import com.intellihr.leave.repository.LeaveRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.entity.NotificationType;
import com.intellihr.notification.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public LeaveServiceImpl(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService
    ) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public LeaveResponse applyForLeave(LeaveRequest request) {

        validateRequest(request);

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        boolean overlapping = leaveRepository
                .existsByEmployeeIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        request.employeeId(),
                        List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED),
                        request.endDate(),
                        request.startDate()
                );

        if (overlapping) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An overlapping leave request already exists"
            );
        }

        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType(request.leaveType());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason().trim());
        leave.setStatus(LeaveStatus.PENDING);

        Leave savedLeave = leaveRepository.save(leave);

        notificationService.createNotification(
                new NotificationRequest(
                        employee.getEmail(),
                        "Leave Request Submitted",
                        "Your " + request.leaveType()
                                + " leave request from "
                                + request.startDate() + " to "
                                + request.endDate()
                                + " has been submitted and is pending review.",
                        NotificationType.LEAVE
                )
        );

        return mapToResponse(savedLeave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaves() {
        return leaveRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponse getLeaveById(Long id) {
        return mapToResponse(getLeaveOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getEmployeeLeaves(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found"
            );
        }

        return leaveRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeavesByStatus(LeaveStatus status) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave status is required"
            );
        }

        return leaveRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public LeaveResponse reviewLeave(
            Long id,
            LeaveReviewRequest request
    ) {

        if (request == null || request.status() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Review status is required"
            );
        }

        if (request.status() != LeaveStatus.APPROVED
                && request.status() != LeaveStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Review status must be APPROVED or REJECTED"
            );
        }

        Leave leave = getLeaveOrThrow(id);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending leave requests can be reviewed"
            );
        }

        leave.setStatus(request.status());
        leave.setReviewerRemarks(
                request.reviewerRemarks() == null
                        ? null
                        : request.reviewerRemarks().trim()
        );
        leave.setReviewedAt(LocalDateTime.now());

        Leave savedLeave = leaveRepository.save(leave);

        String title = request.status() == LeaveStatus.APPROVED
                ? "Leave Request Approved"
                : "Leave Request Rejected";

        String message = "Your "
                + leave.getLeaveType()
                + " leave request from "
                + leave.getStartDate()
                + " to "
                + leave.getEndDate()
                + " has been "
                + request.status().name().toLowerCase()
                + "."
                + (leave.getReviewerRemarks() == null
                        || leave.getReviewerRemarks().isBlank()
                        ? ""
                        : " Remarks: " + leave.getReviewerRemarks());

        notificationService.createNotification(
                new NotificationRequest(
                        leave.getEmployee().getEmail(),
                        title,
                        message,
                        NotificationType.LEAVE
                )
        );

        return mapToResponse(savedLeave);
    }

    @Override
    public LeaveResponse cancelLeave(Long id) {

        Leave leave = getLeaveOrThrow(id);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending leave requests can be cancelled"
            );
        }

        leave.setStatus(LeaveStatus.CANCELLED);

        Leave savedLeave = leaveRepository.save(leave);

        notificationService.createNotification(
                new NotificationRequest(
                        leave.getEmployee().getEmail(),
                        "Leave Request Cancelled",
                        "Your " + leave.getLeaveType()
                                + " leave request from "
                                + leave.getStartDate() + " to "
                                + leave.getEndDate()
                                + " has been cancelled.",
                        NotificationType.LEAVE
                )
        );

        return mapToResponse(savedLeave);
    }

    @Override
    public void deleteLeave(Long id) {
        Leave leave = getLeaveOrThrow(id);
        leaveRepository.delete(leave);
    }

    private void validateRequest(LeaveRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave request is required"
            );
        }

        if (request.employeeId() == null
                || request.leaveType() == null
                || request.startDate() == null
                || request.endDate() == null
                || request.reason() == null
                || request.reason().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All required leave details must be provided"
            );
        }

        if (request.startDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave start date cannot be in the past"
            );
        }

        if (request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave end date cannot be before start date"
            );
        }

        if (request.reason().trim().length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave reason cannot exceed 500 characters"
            );
        }
    }

    private Leave getLeaveOrThrow(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Leave request not found"
                ));
    }

    private LeaveResponse mapToResponse(Leave leave) {

        Employee employee = leave.getEmployee();

        return new LeaveResponse(
                leave.getId(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason(),
                leave.getStatus(),
                leave.getReviewerRemarks(),
                leave.getReviewedAt(),
                leave.getCreatedAt(),
                leave.getUpdatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getEmployeeLeaveBalances(
            Long employeeId,
            int year
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        return calculateLeaveBalances(employee, year);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getAllEmployeeLeaveBalances(int year) {
        List<LeaveBalanceResponse> balances = new ArrayList<>();

        for (Employee employee : employeeRepository.findAll()) {
            balances.addAll(calculateLeaveBalances(employee, year));
        }

        return balances;
    }

    private List<LeaveBalanceResponse> calculateLeaveBalances(
            Employee employee,
            int year
    ) {
        if (year < 1 || year > 9999) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid calendar year"
            );
        }

        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);

        List<LeaveBalanceResponse> balances = new ArrayList<>();

        for (LeaveType leaveType : LeaveType.values()) {
            List<Leave> approvedLeaves = leaveRepository
                    .findByEmployeeIdAndLeaveTypeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            employee.getId(),
                            leaveType,
                            LeaveStatus.APPROVED,
                            yearEnd,
                            yearStart
                    );

            int usedDays = 0;

            for (Leave leave : approvedLeaves) {
                LocalDate effectiveStart = leave.getStartDate().isBefore(yearStart)
                        ? yearStart : leave.getStartDate();

                LocalDate effectiveEnd = leave.getEndDate().isAfter(yearEnd)
                        ? yearEnd : leave.getEndDate();

                usedDays += Math.toIntExact(
                        ChronoUnit.DAYS.between(effectiveStart, effectiveEnd) + 1
                );
            }

            int allocatedDays = switch (leaveType) {
                case CASUAL -> 12;
                case SICK -> 12;
                case EARNED -> 15;
                case UNPAID -> 0;
            };

            int remainingDays = leaveType == LeaveType.UNPAID
                    ? 0
                    : allocatedDays - usedDays;

            balances.add(new LeaveBalanceResponse(
                    employee.getId(),
                    employee.getFirstName() + " " + employee.getLastName(),
                    leaveType,
                    allocatedDays,
                    usedDays,
                    remainingDays,
                    year
            ));
        }

        return balances;
    }}