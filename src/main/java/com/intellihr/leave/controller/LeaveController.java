package com.intellihr.leave.controller;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.leave.dto.LeaveRequest;
import com.intellihr.leave.dto.LeaveResponse;
import com.intellihr.leave.dto.LeaveReviewRequest;
import com.intellihr.leave.dto.LeaveBalanceResponse;
import java.time.LocalDate;
import com.intellihr.leave.entity.LeaveStatus;
import com.intellihr.leave.service.LeaveService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;
    private final EmployeeRepository employeeRepository;

    public LeaveController(
            LeaveService leaveService,
            EmployeeRepository employeeRepository
    ) {
        this.leaveService = leaveService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<LeaveResponse> applyForLeave(
            @Valid @RequestBody LeaveRequest request,
            Authentication authentication
    ) {
        Long employeeId;

        if (isPrivileged(authentication)) {
            if (request.employeeId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Employee ID is required for HR and ADMIN leave applications"
                );
            }

            employeeId = request.employeeId();
        } else {
            Employee employee = employeeRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Employee profile not found for the authenticated account"
                    ));

            employeeId = employee.getId();
        }

        LeaveRequest secureRequest = new LeaveRequest(
                employeeId,
                request.leaveType(),
                request.startDate(),
                request.endDate(),
                request.reason()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyForLeave(secureRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<LeaveResponse> getLeaveById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        LeaveResponse response = leaveService.getLeaveById(id);
        checkEmployeeOwnership(response.employeeId(), authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        checkEmployeeOwnership(employeeId, authentication);

        return ResponseEntity.ok(
                leaveService.getEmployeeLeaves(employeeId)
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponse>> getLeavesByStatus(
            @PathVariable LeaveStatus status
    ) {
        return ResponseEntity.ok(
                leaveService.getLeavesByStatus(status)
        );
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveResponse> reviewLeave(
            @PathVariable Long id,
            @Valid @RequestBody LeaveReviewRequest request
    ) {
        return ResponseEntity.ok(
                leaveService.reviewLeave(id, request)
        );
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<LeaveResponse> cancelLeave(
            @PathVariable Long id,
            Authentication authentication
    ) {
        LeaveResponse response = leaveService.getLeaveById(id);
        checkEmployeeOwnership(response.employeeId(), authentication);

        return ResponseEntity.ok(leaveService.cancelLeave(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLeave(@PathVariable Long id) {
        leaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/balance/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveBalanceResponse>> getMyLeaveBalances(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        Employee employee = employeeRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found"
                ));

        int selectedYear = year == null ? LocalDate.now().getYear() : year;

        return ResponseEntity.ok(
                leaveService.getEmployeeLeaveBalances(employee.getId(), selectedYear)
        );
    }

    @GetMapping("/employee/{employeeId}/balance")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveBalanceResponse>> getEmployeeLeaveBalances(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        checkEmployeeOwnership(employeeId, authentication);

        int selectedYear = year == null ? LocalDate.now().getYear() : year;

        return ResponseEntity.ok(
                leaveService.getEmployeeLeaveBalances(employeeId, selectedYear)
        );
    }

    @GetMapping("/balances")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveBalanceResponse>> getAllEmployeeLeaveBalances(
            @RequestParam(required = false) Integer year
    ) {
        int selectedYear = year == null ? LocalDate.now().getYear() : year;

        return ResponseEntity.ok(
                leaveService.getAllEmployeeLeaveBalances(selectedYear)
        );
    }
    private boolean isPrivileged(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                                || authority.getAuthority().equals("ROLE_HR")
                );
    }

    private void checkEmployeeOwnership(
            Long employeeId,
            Authentication authentication
    ) {
        if (isPrivileged(authentication)) {
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
                    "You can only access your own leave records"
            );
        }
    }
}