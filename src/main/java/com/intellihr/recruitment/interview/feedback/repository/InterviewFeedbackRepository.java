package com.intellihr.recruitment.interview.feedback.repository;

import com.intellihr.recruitment.interview.feedback.entity.InterviewFeedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewFeedbackRepository
        extends JpaRepository<InterviewFeedback, Long> {

    Optional<InterviewFeedback> findByInterviewId(Long interviewId);

    boolean existsByInterviewId(Long interviewId);

    List<InterviewFeedback> findAllByOrderBySubmittedAtDesc();
}
