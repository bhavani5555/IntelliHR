package com.intellihr.onboarding.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.service.NotificationService;
import com.intellihr.onboarding.dto.OnboardingProgressResponse;
import com.intellihr.onboarding.dto.OnboardingTaskRequest;
import com.intellihr.onboarding.dto.OnboardingTaskStatusUpdateRequest;
import com.intellihr.onboarding.entity.OnboardingTask;
import com.intellihr.onboarding.entity.OnboardingTaskStatus;
import com.intellihr.onboarding.repository.OnboardingTaskRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceImplTest {

    @Mock
    private OnboardingTaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OnboardingServiceImpl onboardingService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = mock(Employee.class);
    }

    private void stubEmployeeDetails() {
        when(employee.getId()).thenReturn(8L);
        when(employee.getFirstName()).thenReturn("Charan");
        when(employee.getLastName()).thenReturn("Test");
        when(employee.getEmail()).thenReturn("charan@example.com");
    }

    @Test
    void createTaskShouldCreatePendingTaskAndSendNotification() {
        stubEmployeeDetails();
        when(employeeRepository.findById(8L))
                .thenReturn(Optional.of(employee));
        when(employee.isActive()).thenReturn(true);

        when(taskRepository.save(any(OnboardingTask.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingTaskRequest request = new OnboardingTaskRequest(
                8L,
                "  Complete orientation  ",
                "  Review company policies  ",
                LocalDate.now().plusDays(5)
        );

        var response = onboardingService.createTask(
                request, "hr@intellihr.com");

        assertEquals(8L, response.employeeId());
        assertEquals("Complete orientation", response.title());
        assertEquals("Review company policies", response.description());
        assertEquals(OnboardingTaskStatus.PENDING, response.status());
        assertEquals("hr@intellihr.com", response.createdBy());

        verify(taskRepository).save(any(OnboardingTask.class));
        verify(notificationService).createNotification(
                any(NotificationRequest.class));
    }

    @Test
    void createTaskShouldRejectInactiveEmployee() {
        when(employeeRepository.findById(8L))
                .thenReturn(Optional.of(employee));
        when(employee.isActive()).thenReturn(false);

        OnboardingTaskRequest request = new OnboardingTaskRequest(
                8L,
                "Complete orientation",
                "Review company policies",
                LocalDate.now().plusDays(5)
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.createTask(
                        request, "hr@intellihr.com"));

        assertEquals(HttpStatus.BAD_REQUEST.value(),
                exception.getStatusCode().value());

        verify(taskRepository, never()).save(any(OnboardingTask.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    void updateTaskStatusShouldRejectAnotherEmployeesTask() {
        when(employee.getEmail()).thenReturn("charan@example.com");
        OnboardingTask task = createTask(OnboardingTaskStatus.PENDING);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));

        OnboardingTaskStatusUpdateRequest request =
                new OnboardingTaskStatusUpdateRequest(
                        OnboardingTaskStatus.IN_PROGRESS);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.updateTaskStatus(
                        1L, request, "another@example.com"));

        assertEquals(HttpStatus.FORBIDDEN.value(),
                exception.getStatusCode().value());

        verify(taskRepository, never()).save(any(OnboardingTask.class));
    }

    @Test
    void updateTaskStatusShouldRejectReopeningCompletedTask() {
        when(employee.getEmail()).thenReturn("charan@example.com");
        OnboardingTask task = createTask(OnboardingTaskStatus.COMPLETED);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));

        OnboardingTaskStatusUpdateRequest request =
                new OnboardingTaskStatusUpdateRequest(
                        OnboardingTaskStatus.IN_PROGRESS);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.updateTaskStatus(
                        1L, request, "charan@example.com"));

        assertEquals(HttpStatus.CONFLICT.value(),
                exception.getStatusCode().value());

        verify(taskRepository, never()).save(any(OnboardingTask.class));
    }

    @Test
    void cancelPendingTaskShouldCancelAndSendNotification() {
        stubEmployeeDetails();
        OnboardingTask task = createTask(OnboardingTaskStatus.PENDING);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(OnboardingTask.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = onboardingService.cancelTask(1L);

        assertEquals(OnboardingTaskStatus.CANCELLED, response.status());

        verify(taskRepository).save(task);
        verify(notificationService).createNotification(
                any(NotificationRequest.class));
    }

    @Test
    void cancelInProgressTaskShouldCancelAndSendNotification() {
        stubEmployeeDetails();
        OnboardingTask task = createTask(OnboardingTaskStatus.IN_PROGRESS);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(OnboardingTask.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = onboardingService.cancelTask(1L);

        assertEquals(OnboardingTaskStatus.CANCELLED, response.status());

        verify(taskRepository).save(task);
        verify(notificationService).createNotification(
                any(NotificationRequest.class));
    }

    @Test
    void cancelCompletedTaskShouldBeRejected() {
        OnboardingTask task = createTask(OnboardingTaskStatus.COMPLETED);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.cancelTask(1L));

        assertEquals(HttpStatus.CONFLICT.value(),
                exception.getStatusCode().value());

        verify(taskRepository, never()).save(any(OnboardingTask.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    void cancelAlreadyCancelledTaskShouldBeRejected() {
        OnboardingTask task = createTask(OnboardingTaskStatus.CANCELLED);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(task));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> onboardingService.cancelTask(1L));

        assertEquals(HttpStatus.CONFLICT.value(),
                exception.getStatusCode().value());

        verify(taskRepository, never()).save(any(OnboardingTask.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    void getEmployeeProgressShouldCalculateCompletionPercentage() {
        when(employee.getId()).thenReturn(8L);
        when(employee.getFirstName()).thenReturn("Charan");
        when(employee.getLastName()).thenReturn("Test");
        when(employeeRepository.findById(8L))
                .thenReturn(Optional.of(employee));

        when(taskRepository.countByEmployeeId(8L))
                .thenReturn(5L);

        when(taskRepository.countByEmployeeIdAndStatus(
                8L, OnboardingTaskStatus.PENDING))
                .thenReturn(1L);

        when(taskRepository.countByEmployeeIdAndStatus(
                8L, OnboardingTaskStatus.IN_PROGRESS))
                .thenReturn(1L);

        when(taskRepository.countByEmployeeIdAndStatus(
                8L, OnboardingTaskStatus.COMPLETED))
                .thenReturn(2L);

        when(taskRepository.countByEmployeeIdAndStatus(
                8L, OnboardingTaskStatus.CANCELLED))
                .thenReturn(1L);

        OnboardingProgressResponse response =
                onboardingService.getEmployeeProgress(8L);

        assertEquals(8L, response.employeeId());
        assertEquals("Charan Test", response.employeeName());
        assertEquals(5L, response.totalTasks());
        assertEquals(1L, response.pendingTasks());
        assertEquals(1L, response.inProgressTasks());
        assertEquals(2L, response.completedTasks());
        assertEquals(1L, response.cancelledTasks());
        assertEquals(50.0, response.completionPercentage());
    }

    private OnboardingTask createTask(OnboardingTaskStatus status) {
        OnboardingTask task = new OnboardingTask();

        task.setId(1L);
        task.setEmployee(employee);
        task.setTitle("Complete HR Orientation");
        task.setDescription("Review company policies");
        task.setDueDate(LocalDate.now().plusDays(5));
        task.setStatus(status);
        task.setCreatedBy("hr@intellihr.com");

        return task;
    }
}