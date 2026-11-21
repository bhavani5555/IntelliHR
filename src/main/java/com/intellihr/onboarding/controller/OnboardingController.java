package com.intellihr.onboarding.controller;

import com.intellihr.onboarding.dto.OnboardingProgressResponse;
import com.intellihr.onboarding.dto.OnboardingTaskRequest;
import com.intellihr.onboarding.dto.OnboardingTaskResponse;
import com.intellihr.onboarding.dto.OnboardingTaskStatusUpdateRequest;
import com.intellihr.onboarding.entity.OnboardingTaskStatus;
import com.intellihr.onboarding.service.OnboardingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public OnboardingTaskResponse createTask(
            @Valid @RequestBody OnboardingTaskRequest request,
            Authentication authentication) {

        return onboardingService.createTask(
                request, authentication.getName());
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<OnboardingTaskResponse> getAllTasks() {
        return onboardingService.getAllTasks();
    }

    @GetMapping("/tasks/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public OnboardingTaskResponse getTaskById(@PathVariable Long id) {
        return onboardingService.getTaskById(id);
    }

    @GetMapping("/tasks/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<OnboardingTaskResponse> getMyTasks(
            Authentication authentication) {
        return onboardingService.getMyTasks(authentication.getName());
    }

    @GetMapping("/tasks/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<OnboardingTaskResponse> getTasksByEmployee(
            @PathVariable Long employeeId) {
        return onboardingService.getTasksByEmployee(employeeId);
    }

    @GetMapping("/tasks/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<OnboardingTaskResponse> getTasksByStatus(
            @PathVariable OnboardingTaskStatus status) {
        return onboardingService.getTasksByStatus(status);
    }

    @PatchMapping("/tasks/{id}/status")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public OnboardingTaskResponse updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody OnboardingTaskStatusUpdateRequest request,
            Authentication authentication) {
        return onboardingService.updateTaskStatus(
                id, request, authentication.getName());
    }

    @PatchMapping("/tasks/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public OnboardingTaskResponse cancelTask(@PathVariable Long id) {
        return onboardingService.cancelTask(id);
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public void deleteTask(@PathVariable Long id) {
        onboardingService.deleteTask(id);
    }

    @GetMapping("/progress/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public OnboardingProgressResponse getEmployeeProgress(
            @PathVariable Long employeeId) {
        return onboardingService.getEmployeeProgress(employeeId);
    }
}
