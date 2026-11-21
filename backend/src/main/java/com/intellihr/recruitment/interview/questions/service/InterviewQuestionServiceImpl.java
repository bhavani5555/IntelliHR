package com.intellihr.recruitment.interview.questions.service;

import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionRequest;
import com.intellihr.recruitment.interview.questions.dto.InterviewQuestionResponse;
import com.intellihr.recruitment.interview.questions.entity.InterviewQuestion;
import com.intellihr.recruitment.interview.questions.repository.InterviewQuestionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class InterviewQuestionServiceImpl implements InterviewQuestionService {

    private final InterviewQuestionRepository repository;

    public InterviewQuestionServiceImpl(
            InterviewQuestionRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public List<InterviewQuestionResponse> generateQuestions(
            InterviewQuestionRequest request
    ) {
        String difficulty = request.difficulty().trim().toUpperCase();
        String questionType = request.questionType().trim().toUpperCase();

        if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Difficulty must be EASY, MEDIUM or HARD"
            );
        }

        if (!List.of("TECHNICAL", "HR", "SCENARIO").contains(questionType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Question type must be TECHNICAL, HR or SCENARIO"
            );
        }

        List<String> templates = getTemplates(questionType, difficulty);

        if (request.numberOfQuestions() > templates.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum " + templates.size()
                            + " unique questions are available for this selection"
            );
        }

        List<InterviewQuestion> questions = new ArrayList<>();

        for (int i = 0; i < request.numberOfQuestions(); i++) {
            InterviewQuestion question = new InterviewQuestion();
            question.setJobRole(request.jobRole().trim());
            question.setSkill(request.skill().trim());
            question.setDifficulty(difficulty);
            question.setQuestionType(questionType);
            question.setQuestionText(
                    templates.get(i)
                            .replace("{skill}", request.skill().trim())
                            .replace("{role}", request.jobRole().trim())
            );
            questions.add(question);
        }

        return repository.saveAll(questions)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getQuestions(
            String jobRole,
            String skill,
            String difficulty
    ) {
        List<InterviewQuestion> questions;

        if (jobRole != null && !jobRole.isBlank()
                && difficulty != null && !difficulty.isBlank()) {
            questions = repository
                    .findByJobRoleIgnoreCaseAndDifficultyIgnoreCase(
                            jobRole.trim(), difficulty.trim()
                    );
        } else if (jobRole != null && !jobRole.isBlank()
                && skill != null && !skill.isBlank()) {
            questions = repository.findByJobRoleIgnoreCaseAndSkillIgnoreCase(
                    jobRole.trim(), skill.trim()
            );
        } else if (jobRole != null && !jobRole.isBlank()) {
            questions = repository.findByJobRoleIgnoreCase(jobRole.trim());
        } else if (skill != null && !skill.isBlank()) {
            questions = repository.findBySkillIgnoreCase(skill.trim());
        } else {
            questions = repository.findAll();
        }

        return questions.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteQuestion(Long id) {
        InterviewQuestion question = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Interview question not found"
                ));

        repository.delete(question);
    }

    private List<String> getTemplates(String type, String difficulty) {

        if ("TECHNICAL".equals(type)) {
            return switch (difficulty) {
                case "EASY" -> List.of(
                        "What is {skill}? Explain its basic concepts.",
                        "Where is {skill} commonly used in a {role} role?",
                        "Explain the main features of {skill}.",
                        "What are the advantages of using {skill}?",
                        "Explain a simple practical example using {skill}."
                );
                case "MEDIUM" -> List.of(
                        "Explain how you would use {skill} to solve a real-world problem.",
                        "What are common challenges when working with {skill}, and how would you handle them?",
                        "Compare different approaches available in {skill}.",
                        "How would you debug a problem involving {skill}?",
                        "Describe a project-level use case of {skill} relevant to a {role}."
                );
                case "HARD" -> List.of(
                        "Explain the internal working and important design considerations of {skill}.",
                        "How would you optimize a large-scale application that heavily uses {skill}?",
                        "Discuss advanced trade-offs when choosing {skill} for an enterprise system.",
                        "How would you troubleshoot a complex production issue involving {skill}?",
                        "Design a scalable solution using {skill} for a challenging {role} requirement."
                );
                default -> List.of();
            };
        }

        if ("HR".equals(type)) {
            return switch (difficulty) {
                case "EASY" -> List.of(
                        "Tell me about yourself and your interest in the {role} position.",
                        "Why are you interested in this {role} opportunity?",
                        "What are your strengths relevant to this role?",
                        "How do you approach learning a new skill such as {skill}?",
                        "What are your career goals as a {role}?"
                );
                case "MEDIUM" -> List.of(
                        "Describe a challenge you faced while learning {skill} and how you handled it.",
                        "How do you manage deadlines when working on a {role} assignment?",
                        "Tell me about a time you received feedback and acted on it.",
                        "How would you explain your knowledge of {skill} to a non-technical person?",
                        "Why should we select you for this {role} position?"
                );
                case "HARD" -> List.of(
                        "Describe a professional failure and explain what you learned from it.",
                        "How would you handle disagreement with a senior team member?",
                        "How do you prioritize competing tasks under pressure?",
                        "What would you do if you disagreed with a technical decision involving {skill}?",
                        "How would you demonstrate ownership of a critical {role} responsibility?"
                );
                default -> List.of();
            };
        }

        return switch (difficulty) {
            case "EASY" -> List.of(
                    "How would you use {skill} to complete a basic task in a {role} position?",
                    "What would you do first when given an unfamiliar {skill} problem?",
                    "How would you ask for help when stuck on a {skill} task?",
                    "How would you verify that your {skill} solution works?",
                    "Describe a simple situation where you would apply {skill}."
            );
            case "MEDIUM" -> List.of(
                    "A task involving {skill} is delayed. How would you investigate and respond?",
                    "How would you handle a disagreement about a {skill} implementation?",
                    "A teammate introduces a defect in a {skill} feature. What would you do?",
                    "How would you prioritize two urgent tasks in a {role} project?",
                    "How would you handle changing requirements in a {skill}-based task?"
            );
            case "HARD" -> List.of(
                    "A production issue involving {skill} affects customers. Explain your response.",
                    "How would you resolve a critical conflict between two approaches to a {skill} problem?",
                    "A project using {skill} is missing its deadline. How would you recover it?",
                    "How would you investigate repeated failures in a system using {skill}?",
                    "How would you make a high-impact decision with incomplete information in a {role} project?"
            );
            default -> List.of();
        };
    }

    private InterviewQuestionResponse mapToResponse(
            InterviewQuestion question
    ) {
        return new InterviewQuestionResponse(
                question.getId(),
                question.getJobRole(),
                question.getSkill(),
                question.getQuestionText(),
                question.getDifficulty(),
                question.getQuestionType(),
                question.getCreatedAt()
        );
    }
}