package com.intellihr.auth.controller;

import com.intellihr.auth.dto.AuthResponse;
import com.intellihr.auth.dto.LoginRequest;
import com.intellihr.auth.dto.RegisterRequest;
import com.intellihr.auth.dto.RoleUpdateRequest;
import com.intellihr.auth.dto.UserRoleResponse;
import com.intellihr.auth.dto.ChangePasswordRequest;
import com.intellihr.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        authService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRoleResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody RoleUpdateRequest request) {

        return ResponseEntity.ok(
                authService.updateUserRole(userId, request)
        );
    }
}
