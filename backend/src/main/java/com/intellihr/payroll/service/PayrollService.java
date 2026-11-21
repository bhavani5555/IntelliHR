package com.intellihr.payroll.service;

import com.intellihr.payroll.dto.PayrollRequest;
import com.intellihr.payroll.dto.PayrollResponse;
import com.intellihr.payroll.entity.PayrollStatus;

import java.util.List;

public interface PayrollService {

    PayrollResponse createPayroll(PayrollRequest request);

    List<PayrollResponse> getAllPayrolls();

    PayrollResponse getPayrollById(Long id);

    List<PayrollResponse> getEmployeePayrolls(Long employeeId);

    List<PayrollResponse> getPayrollsByMonthAndYear(
        Integer month,
        Integer year
    );

    List<PayrollResponse> getPayrollsByStatus(PayrollStatus status);

    PayrollResponse processPayroll(Long id);

    PayrollResponse markPayrollAsPaid(Long id);

    void deletePayroll(Long id);

    com.intellihr.payroll.dto.PayrollDashboardSummary getDashboardSummary();
}
