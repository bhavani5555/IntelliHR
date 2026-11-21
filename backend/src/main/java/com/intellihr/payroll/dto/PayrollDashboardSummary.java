package com.intellihr.payroll.dto;

import java.math.BigDecimal;

public record PayrollDashboardSummary(
        long totalPayrollRecords,
        BigDecimal totalAmountPaid,
        long paidPayrolls,
        long pendingActions
) {
}
