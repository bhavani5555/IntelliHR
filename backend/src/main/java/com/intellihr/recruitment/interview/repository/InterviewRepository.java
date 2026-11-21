package com.intellihr.recruitment.interview.repository;

import com.intellihr.recruitment.interview.entity.Interview;
import com.intellihr.recruitment.interview.entity.InterviewStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findAllByOrderByScheduledAtAsc();

    List<Interview> findByJobApplicationIdOrderByScheduledAtAsc(
            Long jobApplicationId
    );

    List<Interview> findByInterviewerIdOrderByScheduledAtAsc(
            Long interviewerId
    );

    List<Interview> findByStatusOrderByScheduledAtAsc(
            InterviewStatus status
    );

    List<Interview> findByInterviewerIdAndStatusOrderByScheduledAtAsc(
            Long interviewerId,
            InterviewStatus status
    );

    long countByStatus(InterviewStatus status);
}
