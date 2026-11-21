package com.intellihr.notification.dto;

import com.intellihr.notification.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String recipientEmail,
        String title,
        String message,
        NotificationType type,
        boolean read,
        LocalDateTime createdAt
) {
}