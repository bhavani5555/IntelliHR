package com.intellihr.payroll.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.entity.NotificationType;
import com.intellihr.notification.service.NotificationService;
import com.intellihr.payroll.dto.PayrollDashboardSummary;
import com.intellihr.payroll.dto.PayrollRequest;
import com.intellihr.payroll.dto.PayrollResponse;
import com.intellihr.payroll.entity.Payroll;
import com.intellihr.payroll.entity.PayrollStatus;
import com.intellihr.payroll.repository.PayrollRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public PayrollServiceImpl(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public PayrollResponse createPayroll(PayrollRequest request) {

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"
                ));

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot create payroll for an inactive employee"
            );
        }

        if (payrollRepository.existsByEmployeeIdAndSalaryMonthAndSalaryYear(
                request.employeeId(),
                request.salaryMonth(),
                request.salaryYear())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payroll already exists for this employee and month"
            );
        }

        BigDecimal grossSalary = request.basicSalary()
                .add(request.hra())
                .add(request.otherAllowances());

        if (request.deductions().compareTo(grossSalary) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Deductions cannot exceed gross salary"
            );
        }

        BigDecimal netSalary = grossSalary.subtract(request.deductions());

        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setSalaryMonth(request.salaryMonth());
        payroll.setSalaryYear(request.salaryYear());
        payroll.setBasicSalary(request.basicSalary());
        payroll.setHra(request.hra());
        payroll.setOtherAllowances(request.otherAllowances());
        payroll.setDeductions(request.deductions());
        payroll.setGrossSalary(grossSalary);
        payroll.setNetSalary(netSalary);
        payroll.setStatus(PayrollStatus.DRAFT);

        return mapToResponse(payrollRepository.save(payroll));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponse> getAllPayrolls() {
        return payrollRepository.findAllByOrderBySalaryYearDescSalaryMonthDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollResponse getPayrollById(Long id) {
        return mapToResponse(findPayrollById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponse> getEmployeePayrolls(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Employee not found"
            );
        }

        return payrollRepository
                .findByEmployeeIdOrderBySalaryYearDescSalaryMonthDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponse> getPayrollsByMonthAndYear(
            Integer month,
            Integer year) {

        if (month == null || month < 1 || month > 12) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Month must be between 1 and 12"
            );
        }

        if (year == null || year < 2000 || year > 2100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid salary year"
            );
        }

        return payrollRepository
                .findBySalaryMonthAndSalaryYearOrderByIdAsc(month, year)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponse> getPayrollsByStatus(PayrollStatus status) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Payroll status is required"
            );
        }

        return payrollRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PayrollResponse processPayroll(Long id) {

        Payroll payroll = findPayrollById(id);

        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only draft payrolls can be processed"
            );
        }

        payroll.setStatus(PayrollStatus.PROCESSED);
        payroll.setProcessedDate(LocalDate.now());

        Payroll savedPayroll = payrollRepository.save(payroll);

        notificationService.createNotification(
                new NotificationRequest(
                        payroll.getEmployee().getEmail(),
                        "Payroll Processed",
                        "Your payroll for "
                                + payroll.getSalaryMonth() + "/"
                                + payroll.getSalaryYear()
                                + " has been processed. Your net salary is "
                                + payroll.getNetSalary() + ".",
                        NotificationType.PAYROLL
                )
        );

        return mapToResponse(savedPayroll);
    }

    @Override
    public PayrollResponse markPayrollAsPaid(Long id) {

        Payroll payroll = findPayrollById(id);

        if (payroll.getStatus() != PayrollStatus.PROCESSED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only processed payrolls can be marked as paid"
            );
        }

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaidDate(LocalDate.now());

        Payroll savedPayroll = payrollRepository.save(payroll);

        notificationService.createNotification(
                new NotificationRequest(
                        payroll.getEmployee().getEmail(),
                        "Salary Paid",
                        "Your salary for "
                                + payroll.getSalaryMonth() + "/"
                                + payroll.getSalaryYear()
                                + " has been marked as paid. Amount: "
                                + payroll.getNetSalary() + ".",
                        NotificationType.PAYROLL
                )
        );

        return mapToResponse(savedPayroll);
    }

    @Override
    public void deletePayroll(Long id) {

        Payroll payroll = findPayrollById(id);

        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only draft payrolls can be deleted"
            );
        }

        payrollRepository.delete(payroll);
    }


    @Override
    @Transactional(readOnly = true)
    public PayrollDashboardSummary getDashboardSummary() {

        long totalPayrollRecords = payrollRepository.count();

        BigDecimal totalAmountPaid = payrollRepository.getTotalAmountByStatus(
                PayrollStatus.PAID
        );

        long paidPayrolls = payrollRepository.countByStatus(
                PayrollStatus.PAID
        );

        long draftPayrolls = payrollRepository.countByStatus(
                PayrollStatus.DRAFT
        );

        long processedPayrolls = payrollRepository.countByStatus(
                PayrollStatus.PROCESSED
        );

        return new PayrollDashboardSummary(
                totalPayrollRecords,
                totalAmountPaid,
                paidPayrolls,
                draftPayrolls + processedPayrolls
        );
    }
    private Payroll findPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payroll not found"
                ));
    }

    private PayrollResponse mapToResponse(Payroll payroll) {

        Employee employee = payroll.getEmployee();

        String employeeName = employee.getFirstName()
                + " " + employee.getLastName();

        return new PayrollResponse(
                payroll.getId(),
                employee.getId(),
                employeeName,
                payroll.getSalaryMonth(),
                payroll.getSalaryYear(),
                payroll.getBasicSalary(),
                payroll.getHra(),
                payroll.getOtherAllowances(),
                payroll.getDeductions(),
                payroll.getGrossSalary(),
                payroll.getNetSalary(),
                payroll.getStatus(),
                payroll.getProcessedDate(),
                payroll.getPaidDate(),
                payroll.getCreatedAt(),
                payroll.getUpdatedAt()
        );
    }
}
