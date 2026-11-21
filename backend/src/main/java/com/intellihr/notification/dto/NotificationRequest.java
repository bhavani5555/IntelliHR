package com.intellihr.notification.dto;

import com.intellihr.notification.entity.NotificationType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationRequest(

        @NotBlank(message = "Recipient email is required")
        @Email(message = "Enter a valid recipient email")
        @Size(max = 150)
        String recipientEmail,

        @NotBlank(message = "Title is required")
        @Size(max = 150)
        String title,

        @NotBlank(message = "Message is required")
        @Size(max = 1000)
        String message,

        @NotNull(message = "Notification type is required")
        NotificationType type
) {
}