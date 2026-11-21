package com.intellihr.performance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PerformanceReviewRequest(

    @NotNull
    Long employeeId,

    @NotNull
    Long reviewerId,

    @NotBlank
    @Size(max = 50)
    String reviewPeriod,

    @NotNull
    @Min(1)
    @Max(5)
    Integer overallRating,

    @Size(max = 2000)
    String strengths,

    @Size(max = 2000)
    String areasForImprovement,

    @Size(max = 2000)
    String goals,

    @Size(max = 2000)
    String feedback

) {
}
