package com.intellihr.notification.controller;

import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.dto.NotificationResponse;
import com.intellihr.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(getCurrentUserEmail())
        );
    }

    @GetMapping("/my/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<NotificationResponse>>
    getMyUnreadNotifications() {
        return ResponseEntity.ok(
                notificationService.getMyUnreadNotifications(
                        getCurrentUserEmail()
                )
        );
    }

    @GetMapping("/my/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        notificationService.getUnreadCount(
                                getCurrentUserEmail()
                        )
                )
        );
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(
                        id,
                        getCurrentUserEmail()
                )
        );
    }

    @PatchMapping("/my/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUserEmail());

        return ResponseEntity.ok(
                Map.of("message", "All notifications marked as read")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id
    ) {
        notificationService.deleteNotification(
                id,
                getCurrentUserEmail()
        );

        return ResponseEntity.noContent().build();
    }

    private String getCurrentUserEmail() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication.getName();
    }
}