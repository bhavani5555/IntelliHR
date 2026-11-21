package com.intellihr.audit.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String userEmail,
        String action,
        String endpoint,
        String httpMethod,
        int statusCode,
        String ipAddress,
        LocalDateTime createdAt
) {
}