package com.intellihr.notification.service;

import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.dto.NotificationResponse;
import com.intellihr.notification.entity.Notification;
import com.intellihr.notification.repository.NotificationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationResponse createNotification(
            NotificationRequest request
    ) {
        Notification notification = new Notification();

        notification.setRecipientEmail(
                request.recipientEmail().trim()
        );
        notification.setTitle(request.title().trim());
        notification.setMessage(request.message().trim());
        notification.setType(request.type());

        return mapToResponse(
                notificationRepository.save(notification)
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            String recipientEmail
    ) {
        return notificationRepository
                .findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(
                        recipientEmail
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications(
            String recipientEmail
    ) {
        return notificationRepository
                .findByRecipientEmailIgnoreCaseAndReadFalseOrderByCreatedAtDesc(
                        recipientEmail
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String recipientEmail) {
        return notificationRepository
                .countByRecipientEmailIgnoreCaseAndReadFalse(
                        recipientEmail
                );
    }

    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId,
            String recipientEmail
    ) {
        Notification notification = notificationRepository
                .findByIdAndRecipientEmailIgnoreCase(
                        notificationId,
                        recipientEmail
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        notification.setRead(true);

        return mapToResponse(
                notificationRepository.save(notification)
        );
    }

    @Transactional
    public void markAllAsRead(String recipientEmail) {
        List<Notification> notifications = notificationRepository
                .findByRecipientEmailIgnoreCaseAndReadFalseOrderByCreatedAtDesc(
                        recipientEmail
                );

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(
            Long notificationId,
            String recipientEmail
    ) {
        Notification notification = notificationRepository
                .findByIdAndRecipientEmailIgnoreCase(
                        notificationId,
                        recipientEmail
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientEmail(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}