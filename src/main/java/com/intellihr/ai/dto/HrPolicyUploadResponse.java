package com.intellihr.ai.dto;

import java.time.LocalDateTime;

public record HrPolicyUploadResponse(
        Long documentId,
        String fileName,
        Long fileSize,
        Integer totalChunks,
        LocalDateTime uploadedAt,
        String message
) {}
