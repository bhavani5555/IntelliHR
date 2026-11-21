package com.intellihr.employee.dto;

import java.time.LocalDate;

public record EmployeeResponse(

    Long id,
    String firstName,
    String lastName,
    String email,
    String department,
    String designation,
    String phoneNumber,
    LocalDate dateOfBirth,
    LocalDate joiningDate,
    String address,
    boolean active

) {}
