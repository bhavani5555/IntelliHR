package com.intellihr.employee.dto;

public record DepartmentStatisticsResponse(
        String department,
        Long totalEmployees,
        Long activeEmployees,
        Long inactiveEmployees
) {}
