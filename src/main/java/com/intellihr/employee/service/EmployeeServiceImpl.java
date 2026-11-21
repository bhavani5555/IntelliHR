package com.intellihr.employee.service;

import com.intellihr.employee.dto.DepartmentStatisticsResponse;
import com.intellihr.employee.dto.EmployeeProfileUpdateRequest;
import com.intellihr.employee.dto.EmployeeRequest;
import com.intellihr.employee.dto.EmployeeResponse;
import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Employee email already exists"
            );
        }

        Employee employee = new Employee();
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setDepartment(request.department());
        employee.setDesignation(request.designation());
        employee.setPhoneNumber(request.phoneNumber());
        employee.setDateOfBirth(request.dateOfBirth());
        employee.setJoiningDate(request.joiningDate());
        employee.setAddress(request.address());

        Employee savedEmployee = employeeRepository.save(employee);

        return mapToResponse(savedEmployee);
    }

    @Override
    public List<EmployeeResponse> getAllEmployees(boolean active) {

        return employeeRepository.findByActive(active, Pageable.unpaged())
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<EmployeeResponse> getEmployees(boolean active, Pageable pageable) {

        return employeeRepository.findByActive(active, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<EmployeeResponse> searchEmployees(
            String search,
            String department,
            String designation,
            Boolean active,
            Pageable pageable) {

        return employeeRepository.searchEmployees(
                search,
                department,
                designation,
                active,
                pageable
        ).map(this::mapToResponse);
    }

    @Override
    public List<DepartmentStatisticsResponse> getDepartmentStatistics() {
        return employeeRepository.getDepartmentStatistics();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found with ID: " + id
                ));

        return mapToResponse(employee);
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found with ID: " + id
                ));

        employeeRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Employee email already exists"
                    );
                });

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setDepartment(request.department());
        employee.setDesignation(request.designation());
        employee.setPhoneNumber(request.phoneNumber());
        employee.setDateOfBirth(request.dateOfBirth());
        employee.setJoiningDate(request.joiningDate());
        employee.setAddress(request.address());

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }

    @Override
    public EmployeeResponse updateEmployeeStatus(Long id, boolean active) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found with ID: " + id
                ));

        employee.setActive(active);

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }

    @Override
    public EmployeeResponse getMyProfile(String email) {

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee profile not found for the authenticated account"
                ));

        return mapToResponse(employee);
    }

    @Override
    public EmployeeResponse updateMyProfile(
            String email,
            EmployeeProfileUpdateRequest request) {

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee profile not found for the authenticated account"
                ));

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setPhoneNumber(request.phoneNumber());
        employee.setDateOfBirth(request.dateOfBirth());
        employee.setAddress(request.address());

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found with ID: " + id
                ));

        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {

        return new EmployeeResponse(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getDepartment(),
            employee.getDesignation(),
            employee.getPhoneNumber(),
            employee.getDateOfBirth(),
            employee.getJoiningDate(),
            employee.getAddress(),
            employee.isActive()
        );
    }
}