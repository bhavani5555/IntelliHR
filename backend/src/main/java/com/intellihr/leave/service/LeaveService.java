package com.intellihr.leave.service;

import com.intellihr.leave.dto.LeaveRequest;
import com.intellihr.leave.dto.LeaveResponse;
import com.intellihr.leave.dto.LeaveReviewRequest;
import com.intellihr.leave.dto.LeaveBalanceResponse;
import com.intellihr.leave.entity.LeaveStatus;

import java.util.List;

public interface LeaveService {

    LeaveResponse applyForLeave(LeaveRequest request);

    List<LeaveResponse> getAllLeaves();

    LeaveResponse getLeaveById(Long id);

    List<LeaveResponse> getEmployeeLeaves(Long employeeId);

    List<LeaveResponse> getLeavesByStatus(LeaveStatus status);

    LeaveResponse reviewLeave(Long id, LeaveReviewRequest request);

    LeaveResponse cancelLeave(Long id);

    void deleteLeave(Long id);

    List<LeaveBalanceResponse> getEmployeeLeaveBalances(Long employeeId, int year);

    List<LeaveBalanceResponse> getAllEmployeeLeaveBalances(int year);
}