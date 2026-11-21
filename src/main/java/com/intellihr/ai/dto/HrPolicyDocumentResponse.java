package com.intellihr.ai.dto;

import java.time.LocalDateTime;

public record HrPolicyDocumentResponse(
        Long documentId,
        String fileName,
        Long fileSize,
        Integer totalChunks,
        LocalDateTime uploadedAt
) {}