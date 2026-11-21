package com.intellihr.onboarding.service;

import com.intellihr.onboarding.dto.OnboardingProgressResponse;
import com.intellihr.onboarding.dto.OnboardingTaskRequest;
import com.intellihr.onboarding.dto.OnboardingTaskResponse;
import com.intellihr.onboarding.dto.OnboardingTaskStatusUpdateRequest;
import com.intellihr.onboarding.entity.OnboardingTaskStatus;

import java.util.List;

public interface OnboardingService {

    OnboardingTaskResponse createTask(
            OnboardingTaskRequest request,
            String createdBy
    );

    List<OnboardingTaskResponse> getAllTasks();

    OnboardingTaskResponse getTaskById(Long id);

    List<OnboardingTaskResponse> getMyTasks(String employeeEmail);

    List<OnboardingTaskResponse> getTasksByEmployee(Long employeeId);

    List<OnboardingTaskResponse> getTasksByStatus(OnboardingTaskStatus status);

    OnboardingTaskResponse updateTaskStatus(
            Long id,
            OnboardingTaskStatusUpdateRequest request,
            String employeeEmail
    );

    OnboardingTaskResponse cancelTask(Long id);

    void deleteTask(Long id);

    OnboardingProgressResponse getEmployeeProgress(Long employeeId);
}
