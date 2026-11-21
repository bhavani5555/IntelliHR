package com.intellihr.recruitment.candidate.repository;

import com.intellihr.recruitment.candidate.entity.Candidate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<Candidate> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);

    List<Candidate> findBySkillsContainingIgnoreCase(String skills);

    List<Candidate> findByCurrentLocationIgnoreCase(String currentLocation);
}
