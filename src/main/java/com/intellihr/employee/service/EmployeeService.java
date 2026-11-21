
package com.intellihr.employee.service;

import com.intellihr.employee.dto.DepartmentStatisticsResponse;
import com.intellihr.employee.dto.EmployeeProfileUpdateRequest;
import com.intellihr.employee.dto.EmployeeRequest;
import com.intellihr.employee.dto.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    List<EmployeeResponse> getAllEmployees(boolean active);

    Page<EmployeeResponse> getEmployees(boolean active, Pageable pageable);

    Page<EmployeeResponse> searchEmployees(
            String search,
            String department,
            String designation,
            Boolean active,
            Pageable pageable
    );

    List<DepartmentStatisticsResponse> getDepartmentStatistics();

    EmployeeResponse getEmployeeById(Long id);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    EmployeeResponse updateEmployeeStatus(Long id, boolean active);

    EmployeeResponse getMyProfile(String email);

    EmployeeResponse updateMyProfile(
            String email,
            EmployeeProfileUpdateRequest request
    );

    void deleteEmployee(Long id);
}