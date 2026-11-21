package com.intellihr.audit.interceptor;

import com.intellihr.audit.service.AuditLogService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuditLogInterceptor implements HandlerInterceptor {

    private final AuditLogService auditLogService;

    public AuditLogInterceptor(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception
    ) {

        String method = request.getMethod();

        if (!method.equals("POST")
                && !method.equals("PUT")
                && !method.equals("PATCH")
                && !method.equals("DELETE")) {
            return;
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {
            return;
        }

        String action = switch (method) {
            case "POST" -> "CREATE";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "UNKNOWN";
        };

        String ipAddress = request.getRemoteAddr();

        try {
            auditLogService.recordAction(
                    authentication.getName(),
                    action,
                    request.getRequestURI(),
                    method,
                    response.getStatus(),
                    ipAddress
            );
        } catch (Exception auditException) {
            // Audit failure must not replace the original API response.
        }
    }
}