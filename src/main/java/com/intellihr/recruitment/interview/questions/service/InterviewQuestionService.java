package com.intellihr.recruitment.interview.questions.service;

import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionRequest;
import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionResponse;

import java.util.List;

public interface InterviewQuestionService {

    List<InterviewQuestionResponse> generateQuestions(
            InterviewQuestionRequest request
    );

    List<InterviewQuestionResponse> getQuestions(
            String jobRole,
            String skill,
            String difficulty
    );

    void deleteQuestion(Long id);
}