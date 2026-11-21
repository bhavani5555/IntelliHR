package com.intellihr.document.dto;

import java.time.LocalDateTime;

public record EmployeeDocumentResponse(

    Long id,
    Long employeeId,
    String originalFileName,
    String contentType,
    Long fileSize,
    LocalDateTime uploadedAt

) {}
