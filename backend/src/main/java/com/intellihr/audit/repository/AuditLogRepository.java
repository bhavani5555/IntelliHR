package com.intellihr.audit.repository;

import com.intellihr.audit.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findByUserEmailIgnoreCaseOrderByCreatedAtDesc(
            String userEmail
    );

    List<AuditLog> findByActionIgnoreCaseOrderByCreatedAtDesc(
            String action
    );
}