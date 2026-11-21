package com.intellihr.recruitment.candidate.dto;

import java.time.LocalDateTime;

public record CandidateResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String currentLocation,
        Integer yearsOfExperience,
        String skills,
        String highestQualification,
        String resumeFileName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
