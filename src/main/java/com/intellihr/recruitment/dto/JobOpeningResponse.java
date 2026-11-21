package com.intellihr.recruitment.dto;

import com.intellihr.recruitment.entity.JobStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobOpeningResponse(

    Long id,
    String title,
    String department,
    String description,
    String requiredSkills,
    Integer numberOfVacancies,
    String employmentType,
    String location,
    BigDecimal minimumSalary,
    BigDecimal maximumSalary,
    LocalDate applicationDeadline,
    JobStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt

) {}
