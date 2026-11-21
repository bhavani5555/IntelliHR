package com.intellihr.payroll.controller;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.payroll.dto.PayrollDashboardSummary;
import com.intellihr.payroll.dto.PayrollRequest;
import com.intellihr.payroll.dto.PayrollResponse;
import com.intellihr.payroll.entity.PayrollStatus;
import com.intellihr.payroll.service.PayrollService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;
    private final EmployeeRepository employeeRepository;

    public PayrollController(
            PayrollService payrollService,
            EmployeeRepository employeeRepository) {
        this.payrollService = payrollService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<PayrollResponse> createPayroll(
            @Valid @RequestBody PayrollRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payrollService.createPayroll(request));
    }

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<PayrollDashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(payrollService.getDashboardSummary());
    }
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<List<PayrollResponse>> getAllPayrolls() {

        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE')")
    public ResponseEntity<PayrollResponse> getPayrollById(
            @PathVariable Long id,
            Authentication authentication) {

        PayrollResponse response = payrollService.getPayrollById(id);

        checkEmployeeOwnership(response.employeeId(), authentication);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<PayrollResponse>> getEmployeePayrolls(
            @PathVariable Long employeeId,
            Authentication authentication) {

        checkEmployeeOwnership(employeeId, authentication);

        return ResponseEntity.ok(
                payrollService.getEmployeePayrolls(employeeId)
        );
    }

    @GetMapping("/month/{month}/year/{year}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<List<PayrollResponse>> getPayrollsByMonthAndYear(
            @PathVariable Integer month,
            @PathVariable Integer year) {

        return ResponseEntity.ok(
                payrollService.getPayrollsByMonthAndYear(month, year)
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<List<PayrollResponse>> getPayrollsByStatus(
            @PathVariable PayrollStatus status) {

        return ResponseEntity.ok(
                payrollService.getPayrollsByStatus(status)
        );
    }

    @PatchMapping("/{id}/process")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<PayrollResponse> processPayroll(
            @PathVariable Long id) {

        return ResponseEntity.ok(payrollService.processPayroll(id));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<PayrollResponse> markPayrollAsPaid(
            @PathVariable Long id) {

        return ResponseEntity.ok(payrollService.markPayrollAsPaid(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {

        payrollService.deletePayroll(id);

        return ResponseEntity.noContent().build();
    }

    private void checkEmployeeOwnership(
            Long employeeId,
            Authentication authentication) {

        boolean isAdminOrHr = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_HR"));

        if (isAdminOrHr) {
            return;
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new org.springframework.web.server
                        .ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Employee not found"
                        ));

        if (!employee.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this employee's payroll"
            );
        }
    }
}
