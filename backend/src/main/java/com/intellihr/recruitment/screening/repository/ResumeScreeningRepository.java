package com.intellihr.recruitment.screening.repository;

import com.intellihr.recruitment.screening.entity.ResumeScreening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeScreeningRepository
        extends JpaRepository<ResumeScreening, Long> {

    Optional<ResumeScreening> findByApplicationId(Long applicationId);
}