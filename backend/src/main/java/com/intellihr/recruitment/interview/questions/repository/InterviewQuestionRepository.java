package com.intellihr.recruitment.interview.questions.repository;

import com.intellihr.recruitment.interview.questions.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByJobRoleIgnoreCase(String jobRole);

    List<InterviewQuestion> findBySkillIgnoreCase(String skill);

    List<InterviewQuestion> findByJobRoleIgnoreCaseAndDifficultyIgnoreCase(
            String jobRole,
            String difficulty
    );

    List<InterviewQuestion> findByJobRoleIgnoreCaseAndSkillIgnoreCase(
            String jobRole,
            String skill
    );
}