package com.intellihr.recruitment.dto;

import com.intellihr.recruitment.entity.JobStatus;
import jakarta.validation.constraints.NotNull;

public record JobStatusUpdateRequest(

    @NotNull(message = "Job status is required")
    JobStatus status

) {}
