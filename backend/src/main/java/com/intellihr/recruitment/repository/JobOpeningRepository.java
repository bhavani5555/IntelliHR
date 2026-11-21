package com.intellihr.recruitment.repository;

import com.intellihr.recruitment.entity.JobOpening;
import com.intellihr.recruitment.entity.JobStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {

    List<JobOpening> findByDepartmentIgnoreCase(String department);

    List<JobOpening> findByStatusOrderByCreatedAtDesc(JobStatus status);

    List<JobOpening> findByStatusAndApplicationDeadlineGreaterThanEqualOrderByCreatedAtDesc(
            JobStatus status,
            java.time.LocalDate applicationDeadline
    );

    List<JobOpening> findByTitleContainingIgnoreCase(String title);

    List<JobOpening> findAllByOrderByCreatedAtDesc();

    long countByStatus(JobStatus status);

    long countByDepartmentIgnoreCase(String department);

    @Query("SELECT DISTINCT j.department FROM JobOpening j ORDER BY j.department")
    List<String> findDistinctDepartments();
}

