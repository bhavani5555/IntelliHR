package com.intellihr.audit.controller;

import com.intellihr.audit.dto.AuditLogResponse;
import com.intellihr.audit.service.AuditLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {
        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs()
        );
    }

    @GetMapping("/user")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByUser(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(
                auditLogService.getAuditLogsByUser(email)
        );
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByAction(
            @PathVariable String action
    ) {
        return ResponseEntity.ok(
                auditLogService.getAuditLogsByAction(action)
        );
    }
}