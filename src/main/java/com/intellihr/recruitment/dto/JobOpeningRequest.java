package com.intellihr.recruitment.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobOpeningRequest(

    @NotBlank(message = "Job title is required")
    @Size(max = 150)
    String title,

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    String department,

    @NotBlank(message = "Job description is required")
    @Size(max = 5000)
    String description,

    @Size(max = 2000)
    String requiredSkills,

    @NotNull(message = "Number of vacancies is required")
    @Min(value = 1, message = "At least one vacancy is required")
    Integer numberOfVacancies,

    @NotBlank(message = "Employment type is required")
    @Size(max = 50)
    String employmentType,

    @NotBlank(message = "Job location is required")
    @Size(max = 150)
    String location,

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 10, fraction = 2,
            message = "Minimum salary must have at most two decimal places")
    BigDecimal minimumSalary,

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 10, fraction = 2,
            message = "Maximum salary must have at most two decimal places")
    BigDecimal maximumSalary,

    @NotNull(message = "Application deadline is required")
    @FutureOrPresent(message = "Application deadline cannot be in the past")
    LocalDate applicationDeadline

) {}