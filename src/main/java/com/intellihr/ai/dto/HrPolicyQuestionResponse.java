package com.intellihr.ai.dto;

import java.util.List;

public record HrPolicyQuestionResponse(
        String question,
        String answer,
        List<HrPolicySourceReference> sourceReferences,
        String status,
        Long conversationId
) {}