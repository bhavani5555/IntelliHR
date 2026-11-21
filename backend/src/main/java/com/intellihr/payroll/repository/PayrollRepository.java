package com.intellihr.payroll.repository;

import com.intellihr.payroll.entity.Payroll;
import com.intellihr.payroll.entity.PayrollStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findAllByOrderBySalaryYearDescSalaryMonthDesc();

    List<Payroll> findByEmployeeIdOrderBySalaryYearDescSalaryMonthDesc(
        Long employeeId
    );

    List<Payroll> findBySalaryMonthAndSalaryYearOrderByIdAsc(
        Integer salaryMonth,
        Integer salaryYear
    );

    List<Payroll> findByStatusOrderByCreatedAtDesc(
        PayrollStatus status
    );

    Optional<Payroll> findByEmployeeIdAndSalaryMonthAndSalaryYear(
        Long employeeId,
        Integer salaryMonth,
        Integer salaryYear
    );

    boolean existsByEmployeeIdAndSalaryMonthAndSalaryYear(
        Long employeeId,
        Integer salaryMonth,
        Integer salaryYear
    );

    long countByStatus(PayrollStatus status);

    @Query("""
        SELECT COALESCE(SUM(p.netSalary), 0)
        FROM Payroll p
        WHERE p.status = :status
        """)
    BigDecimal getTotalAmountByStatus(
        @Param("status") PayrollStatus status
    );
}
