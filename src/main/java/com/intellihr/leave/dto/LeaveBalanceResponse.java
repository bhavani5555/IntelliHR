package com.intellihr.leave.dto;

import com.intellihr.leave.entity.LeaveType;

public record LeaveBalanceResponse(
        Long employeeId,
        String employeeName,
        LeaveType leaveType,
        int allocatedDays,
        int usedDays,
        int remainingDays,
        int year
) {
}
