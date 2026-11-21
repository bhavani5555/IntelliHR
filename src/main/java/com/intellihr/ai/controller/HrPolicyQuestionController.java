package com.intellihr.ai.controller;

import com.intellihr.ai.dto.HrPolicyQuestionRequest;
import com.intellihr.ai.dto.HrPolicyQuestionResponse;
import com.intellihr.ai.service.AiConversationService;
import com.intellihr.ai.service.HrPolicyAnswerService;
import com.intellihr.ai.service.HrPolicyAnswerService.PolicyAnswer;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/hr-policies")
public class HrPolicyQuestionController {

    private final HrPolicyAnswerService answerService;
    private final AiConversationService conversationService;

    public HrPolicyQuestionController(
            HrPolicyAnswerService answerService,
            AiConversationService conversationService) {

        this.answerService = answerService;
        this.conversationService = conversationService;
    }

    @PostMapping("/ask")
    public ResponseEntity<HrPolicyQuestionResponse> askQuestion(
            @Valid @RequestBody HrPolicyQuestionRequest request,
            Authentication authentication) {

        PolicyAnswer result =
                answerService.generateAnswer(request.question());

        Long savedConversationId =
                conversationService.saveConversationExchange(
                        request.conversationId(),
                        authentication,
                        result.question(),
                        result.answer()
                );

        HrPolicyQuestionResponse response =
                new HrPolicyQuestionResponse(
                        result.question(),
                        result.answer(),
                        result.sourceReferences(),
                        "success",
                        savedConversationId
                );

        return ResponseEntity.ok(response);
    }
}