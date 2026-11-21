package com.intellihr.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PayrollRequest(

    @NotNull(message = "Employee ID is required")
    Long employeeId,

    @NotNull(message = "Salary month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    Integer salaryMonth,

    @NotNull(message = "Salary year is required")
    @Min(value = 2000, message = "Invalid salary year")
    @Max(value = 2100, message = "Invalid salary year")
    Integer salaryYear,

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.01", message = "Basic salary must be greater than zero")
    BigDecimal basicSalary,

    @NotNull(message = "HRA is required")
    @DecimalMin(value = "0.00", message = "HRA cannot be negative")
    BigDecimal hra,

    @NotNull(message = "Other allowances are required")
    @DecimalMin(value = "0.00", message = "Other allowances cannot be negative")
    BigDecimal otherAllowances,

    @NotNull(message = "Deductions are required")
    @DecimalMin(value = "0.00", message = "Deductions cannot be negative")
    BigDecimal deductions

) {}
