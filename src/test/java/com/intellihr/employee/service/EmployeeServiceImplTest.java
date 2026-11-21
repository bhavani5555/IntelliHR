package com.intellihr.employee.service;

import com.intellihr.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @Test
    void getAllEmployeesShouldReturnEmptyList() {

        when(employeeRepository.findByActive(true, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        var employees = employeeService.getAllEmployees(true);

        assertTrue(employees.isEmpty());
    }
}
