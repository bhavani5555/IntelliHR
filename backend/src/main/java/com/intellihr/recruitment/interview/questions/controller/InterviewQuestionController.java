package com.intellihr.recruitment.interview.questions.controller;

import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionRequest;
import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionResponse;
import com.intellihr.recruitment.interview.questions.service.InterviewQuestionService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruitment/interview-questions")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class InterviewQuestionController {

    private final InterviewQuestionService questionService;

    public InterviewQuestionController(
            InterviewQuestionService questionService
    ) {
        this.questionService = questionService;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<InterviewQuestionResponse>> generateQuestions(
            @Valid @RequestBody InterviewQuestionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.generateQuestions(request));
    }

    @GetMapping
    public ResponseEntity<List<InterviewQuestionResponse>> getQuestions(
            @RequestParam(required = false) String jobRole,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String difficulty
    ) {
        return ResponseEntity.ok(
                questionService.getQuestions(jobRole, skill, difficulty)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id
    ) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}