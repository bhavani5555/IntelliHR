package com.intellihr.ai.controller;

import com.intellihr.ai.dto.HrAnswerResponse;
import com.intellihr.ai.dto.HrQuestionRequest;
import com.intellihr.ai.service.HrAssistantService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/hr-assistant")
public class HrAssistantController {

    private final HrAssistantService hrAssistantService;

    public HrAssistantController(HrAssistantService hrAssistantService) {
        this.hrAssistantService = hrAssistantService;
    }

    @PostMapping("/ask")
    public HrAnswerResponse askQuestion(
            @Valid @RequestBody HrQuestionRequest request) {

        String answer = hrAssistantService.askQuestion(request.question());

        return new HrAnswerResponse(request.question(), answer);
    }
}
