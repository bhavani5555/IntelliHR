package com.intellihr.recruitment.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CandidateJobApplicationRequest(

        @NotNull(message = "Job opening ID is required")
        Long jobOpeningId,

        @Size(max = 2000, message = "Cover letter cannot exceed 2000 characters")
        String coverLetter

) {
}