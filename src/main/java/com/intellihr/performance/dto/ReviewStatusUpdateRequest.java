package com.intellihr.performance.dto;

import jakarta.validation.constraints.Size;

public record ReviewStatusUpdateRequest(

    @Size(max = 1000)
    String employeeRemarks

) {
}
