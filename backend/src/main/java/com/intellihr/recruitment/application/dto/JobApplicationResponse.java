package com.intellihr.recruitment.application.dto;

import com.intellihr.recruitment.application.entity.JobApplicationStatus;

import java.time.LocalDateTime;

public record JobApplicationResponse(

        Long id,

        Long candidateId,
        String candidateName,
        String candidateEmail,
        String phoneNumber,
        String currentLocation,
        Integer yearsOfExperience,
        String skills,
        String highestQualification,
        String resumeFileName,

        Long jobOpeningId,
        String jobTitle,
        String department,

        JobApplicationStatus status,

        String coverLetter,

        LocalDateTime appliedAt,
        LocalDateTime updatedAt

) {
}
