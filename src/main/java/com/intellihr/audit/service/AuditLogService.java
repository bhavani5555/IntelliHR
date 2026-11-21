package com.intellihr.audit.service;

import com.intellihr.audit.dto.AuditLogResponse;
import com.intellihr.audit.entity.AuditLog;
import com.intellihr.audit.repository.AuditLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void recordAction(
            String userEmail,
            String action,
            String endpoint,
            String httpMethod,
            int statusCode,
            String ipAddress
    ) {
        AuditLog auditLog = new AuditLog(
                userEmail,
                action,
                endpoint,
                httpMethod,
                statusCode,
                ipAddress
        );

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByUser(String userEmail) {
        return auditLogRepository
                .findByUserEmailIgnoreCaseOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByAction(String action) {
        return auditLogRepository
                .findByActionIgnoreCaseOrderByCreatedAtDesc(action)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getUserEmail(),
                auditLog.getAction(),
                auditLog.getEndpoint(),
                auditLog.getHttpMethod(),
                auditLog.getStatusCode(),
                auditLog.getIpAddress(),
                auditLog.getCreatedAt()
        );
    }
}