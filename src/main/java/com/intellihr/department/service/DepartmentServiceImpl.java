package com.intellihr.department.service;

import com.intellihr.department.dto.DepartmentRequest;
import com.intellihr.department.dto.DepartmentResponse;
import com.intellihr.department.entity.Department;
import com.intellihr.department.repository.DepartmentRepository;
import com.intellihr.employee.repository.EmployeeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentServiceImpl(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public DepartmentResponse createDepartment(DepartmentRequest request) {

        String departmentName = request.name().trim();

        if (departmentRepository.existsByNameIgnoreCase(departmentName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Department already exists"
            );
        }

        Department department = new Department();
        department.setName(departmentName);
        department.setDescription(request.description());

        Department savedDepartment = departmentRepository.save(department);

        return mapToResponse(savedDepartment);
    }

    @Override
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DepartmentResponse getDepartmentById(Long id) {

        Department department = getDepartmentOrThrow(id);

        return mapToResponse(department);
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        Department department = getDepartmentOrThrow(id);

        String oldName = department.getName();
        String newName = request.name().trim();

        departmentRepository.findByNameIgnoreCase(newName)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Department already exists"
                    );
                });

        if (!oldName.equalsIgnoreCase(newName)) {
            employeeRepository.renameEmployeeDepartment(oldName, newName);
        }

        department.setName(newName);
        department.setDescription(request.description());

        Department updatedDepartment = departmentRepository.save(department);

        return mapToResponse(updatedDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {

        Department department = getDepartmentOrThrow(id);

        boolean employeesExist = employeeRepository
                .existsByDepartmentIgnoreCase(department.getName());

        if (employeesExist) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete department while employees are assigned to it"
            );
        }

        departmentRepository.delete(department);
    }

    private Department getDepartmentOrThrow(Long id) {

        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found with ID: " + id
                ));
    }

    private DepartmentResponse mapToResponse(Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription()
        );
    }
}
