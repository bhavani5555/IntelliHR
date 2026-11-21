package com.intellihr.leave.repository;

import com.intellihr.leave.entity.Leave;
import com.intellihr.leave.entity.LeaveStatus;
import com.intellihr.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<Leave> findByStatusOrderByCreatedAtDesc(LeaveStatus status);

    List<Leave> findAllByOrderByCreatedAtDesc();

    List<Leave> findByEmployeeIdAndLeaveTypeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long employeeId,
            LeaveType leaveType,
            LeaveStatus status,
            LocalDate yearEnd,
            LocalDate yearStart
    );

    boolean existsByEmployeeIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long employeeId,
            List<LeaveStatus> statuses,
            LocalDate endDate,
            LocalDate startDate
    );
}
