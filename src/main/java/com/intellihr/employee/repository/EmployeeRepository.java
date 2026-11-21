package com.intellihr.employee.repository;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.dto.DepartmentStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDepartmentIgnoreCase(String department);

    Page<Employee> findByActive(boolean active, Pageable pageable);

    Page<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName,
            String lastName,
            Pageable pageable
    );

    Page<Employee> findByDepartmentIgnoreCase(
            String department,
            Pageable pageable
    );

    Page<Employee> findByDesignationIgnoreCase(
            String designation,
            Pageable pageable
    );

    Page<Employee> findByDepartmentIgnoreCaseAndDesignationIgnoreCase(
            String department,
            String designation,
            Pageable pageable
    );

    @Modifying
    @Transactional
    @Query("""
            UPDATE Employee e
            SET e.department = :newName
            WHERE LOWER(e.department) = LOWER(:oldName)
            """)
    int renameEmployeeDepartment(
            @Param("oldName") String oldName,
            @Param("newName") String newName
    );

    @Query("""
            SELECT e FROM Employee e
            WHERE
                (:search IS NULL OR :search = ''
                    OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:department IS NULL OR :department = ''
                    OR LOWER(e.department) = LOWER(:department))
            AND (:designation IS NULL OR :designation = ''
                    OR LOWER(e.designation) = LOWER(:designation))
            AND (:active IS NULL OR e.active = :active)
            """)
    Page<Employee> searchEmployees(
            @Param("search") String search,
            @Param("department") String department,
            @Param("designation") String designation,
            @Param("active") Boolean active,
            Pageable pageable
    );

    @Query("""
            SELECT new com.intellihr.employee.dto.DepartmentStatisticsResponse(
                e.department,
                COUNT(e),
                SUM(CASE WHEN e.active = true THEN 1L ELSE 0L END),
                SUM(CASE WHEN e.active = false THEN 1L ELSE 0L END)
            )
            FROM Employee e
            GROUP BY e.department
            ORDER BY e.department
            """)
    List<DepartmentStatisticsResponse> getDepartmentStatistics();
}
