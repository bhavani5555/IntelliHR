package com.intellihr.recruitment.application.repository;

import com.intellihr.recruitment.application.entity.JobApplication;
import com.intellihr.recruitment.application.entity.JobApplicationStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    boolean existsByCandidateIdAndJobOpeningId(
            Long candidateId,
            Long jobOpeningId
    );

    boolean existsByJobOpeningId(Long jobOpeningId);

    List<JobApplication> findByCandidateId(Long candidateId);

    List<JobApplication> findByJobOpeningId(Long jobOpeningId);

    List<JobApplication> findByStatus(JobApplicationStatus status);

    List<JobApplication> findByCandidateIdAndStatus(
            Long candidateId,
            JobApplicationStatus status
    );

    long countByStatus(JobApplicationStatus status);

    @Query("""
            SELECT COUNT(DISTINCT application.candidate.id)
            FROM JobApplication application
            WHERE application.status IN :statuses
            """)
    long countDistinctByCandidateIdAndStatusIn(
            @Param("statuses") Collection<JobApplicationStatus> statuses
    );

    long countByJobOpeningDepartmentIgnoreCase(String department);

    long countByJobOpeningDepartmentIgnoreCaseAndStatus(
            String department,
            JobApplicationStatus status
    );
}