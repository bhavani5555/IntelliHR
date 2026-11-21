package com.intellihr.recruitment.screening.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeScreeningResponse(
        Long screeningId,
        Long applicationId,
        Long candidateId,
        String candidateName,
        Long jobOpeningId,
        String jobTitle,
        Double matchPercentage,
        List<String> matchedSkills,
        List<String> missingSkills,
        String summary,
        LocalDateTime screenedAt
) {
}