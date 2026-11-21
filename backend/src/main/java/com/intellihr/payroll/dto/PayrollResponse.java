package com.intellihr.payroll.dto;

import com.intellihr.payroll.entity.PayrollStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PayrollResponse(

    Long id,
    Long employeeId,
    String employeeName,
    Integer salaryMonth,
    Integer salaryYear,
    BigDecimal basicSalary,
    BigDecimal hra,
    BigDecimal otherAllowances,
    BigDecimal deductions,
    BigDecimal grossSalary,
    BigDecimal netSalary,
    PayrollStatus status,
    LocalDate processedDate,
    LocalDate paidDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt

) {}
