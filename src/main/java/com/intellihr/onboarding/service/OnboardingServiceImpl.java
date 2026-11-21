package com.intellihr.onboarding.service;

import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;
import com.intellihr.notification.dto.NotificationRequest;
import com.intellihr.notification.entity.NotificationType;
import com.intellihr.notification.service.NotificationService;
import com.intellihr.onboarding.dto.OnboardingProgressResponse;
import com.intellihr.onboarding.dto.OnboardingTaskRequest;
import com.intellihr.onboarding.dto.OnboardingTaskResponse;
import com.intellihr.onboarding.dto.OnboardingTaskStatusUpdateRequest;
import com.intellihr.onboarding.entity.OnboardingTask;
import com.intellihr.onboarding.entity.OnboardingTaskStatus;
import com.intellihr.onboarding.repository.OnboardingTaskRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OnboardingServiceImpl implements OnboardingService {

    private final OnboardingTaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public OnboardingServiceImpl(
            OnboardingTaskRepository taskRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public OnboardingTaskResponse createTask(
            OnboardingTaskRequest request,
            String createdBy) {

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot create onboarding tasks for an inactive employee");
        }

        OnboardingTask task = new OnboardingTask();
        task.setEmployee(employee);
        task.setTitle(request.title().trim());
        task.setDescription(
                request.description() == null
                        ? null
                        : request.description().trim()
        );
        task.setDueDate(request.dueDate());
        task.setStatus(OnboardingTaskStatus.PENDING);
        task.setCreatedBy(createdBy);

        OnboardingTask savedTask = taskRepository.save(task);

        notificationService.createNotification(
                new NotificationRequest(
                        employee.getEmail(),
                        "New Onboarding Task",
                        "A new onboarding task has been assigned: "
                                + savedTask.getTitle(),
                        NotificationType.SYSTEM
                )
        );

        return mapToResponse(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingTaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingTaskResponse getTaskById(Long id) {
        return mapToResponse(findTaskById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingTaskResponse> getMyTasks(String employeeEmail) {

        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee profile not found"));

        return taskRepository
                .findByEmployeeIdOrderByDueDateAsc(employee.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingTaskResponse> getTasksByEmployee(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Employee not found");
        }

        return taskRepository
                .findByEmployeeIdOrderByDueDateAsc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingTaskResponse> getTasksByStatus(
            OnboardingTaskStatus status) {

        return taskRepository.findByStatusOrderByDueDateAsc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OnboardingTaskResponse updateTaskStatus(
            Long id,
            OnboardingTaskStatusUpdateRequest request,
            String employeeEmail) {

        OnboardingTask task = findTaskById(id);

        if (!task.getEmployee().getEmail().equalsIgnoreCase(employeeEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can update only your own onboarding tasks");
        }

        OnboardingTaskStatus currentStatus = task.getStatus();
        OnboardingTaskStatus newStatus = request.status();

        if (newStatus == OnboardingTaskStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employees cannot cancel onboarding tasks");
        }

        if (currentStatus == OnboardingTaskStatus.COMPLETED
                || currentStatus == OnboardingTaskStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This onboarding task can no longer be updated");
        }

        if (newStatus != OnboardingTaskStatus.IN_PROGRESS
                && newStatus != OnboardingTaskStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employees can only start or complete onboarding tasks");
        }

        if (currentStatus == newStatus) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Task already has the requested status");
        }

        task.setStatus(newStatus);

        if (newStatus == OnboardingTaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());

            notificationService.createNotification(
                    new NotificationRequest(
                            task.getCreatedBy(),
                            "Onboarding Task Completed",
                            task.getEmployee().getFirstName()
                                    + " "
                                    + task.getEmployee().getLastName()
                                    + " completed the onboarding task: "
                                    + task.getTitle(),
                            NotificationType.SYSTEM
                    )
            );
        }

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public OnboardingTaskResponse cancelTask(Long id) {

        OnboardingTask task = findTaskById(id);

        if (task.getStatus() == OnboardingTaskStatus.COMPLETED
                || task.getStatus() == OnboardingTaskStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Completed or already cancelled tasks cannot be cancelled");
        }

        task.setStatus(OnboardingTaskStatus.CANCELLED);

        OnboardingTask savedTask = taskRepository.save(task);

        notificationService.createNotification(
                new NotificationRequest(
                        task.getEmployee().getEmail(),
                        "Onboarding Task Cancelled",
                        "Your onboarding task has been cancelled: "
                                + task.getTitle(),
                        NotificationType.SYSTEM
                )
        );

        return mapToResponse(savedTask);
    }

    @Override
    public void deleteTask(Long id) {

        OnboardingTask task = findTaskById(id);

        if (task.getStatus() != OnboardingTaskStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending onboarding tasks can be deleted");
        }

        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingProgressResponse getEmployeeProgress(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        long totalTasks = taskRepository.countByEmployeeId(employeeId);

        long pendingTasks = taskRepository.countByEmployeeIdAndStatus(
                employeeId, OnboardingTaskStatus.PENDING);

        long inProgressTasks = taskRepository.countByEmployeeIdAndStatus(
                employeeId, OnboardingTaskStatus.IN_PROGRESS);

        long completedTasks = taskRepository.countByEmployeeIdAndStatus(
                employeeId, OnboardingTaskStatus.COMPLETED);

        long cancelledTasks = taskRepository.countByEmployeeIdAndStatus(
                employeeId, OnboardingTaskStatus.CANCELLED);

        long eligibleTasks = totalTasks - cancelledTasks;

        double completionPercentage = eligibleTasks == 0
                ? 0.0
                : (completedTasks * 100.0) / eligibleTasks;

        return new OnboardingProgressResponse(
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                cancelledTasks,
                Math.round(completionPercentage * 100.0) / 100.0
        );
    }

    private OnboardingTask findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Onboarding task not found"));
    }

    private OnboardingTaskResponse mapToResponse(OnboardingTask task) {

        Employee employee = task.getEmployee();

        return new OnboardingTaskResponse(
                task.getId(),
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getEmail(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getStatus(),
                task.getCreatedBy(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getCompletedAt()
        );
    }
}
