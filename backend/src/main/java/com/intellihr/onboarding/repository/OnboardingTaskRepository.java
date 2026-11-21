package com.intellihr.onboarding.repository;

import com.intellihr.onboarding.entity.OnboardingTask;
import com.intellihr.onboarding.entity.OnboardingTaskStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnboardingTaskRepository
        extends JpaRepository<OnboardingTask, Long> {

    List<OnboardingTask> findByEmployeeIdOrderByDueDateAsc(Long employeeId);

    List<OnboardingTask> findByEmployeeIdAndStatusOrderByDueDateAsc(
            Long employeeId,
            OnboardingTaskStatus status
    );

    List<OnboardingTask> findByStatusOrderByDueDateAsc(
            OnboardingTaskStatus status
    );

    long countByEmployeeId(Long employeeId);

    long countByEmployeeIdAndStatus(
            Long employeeId,
            OnboardingTaskStatus status
    );
}
