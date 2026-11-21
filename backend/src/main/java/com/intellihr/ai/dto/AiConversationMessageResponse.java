package com.intellihr.ai.dto;

import com.intellihr.ai.entity.AiConversationMessage.MessageRole;

import java.time.LocalDateTime;

public record AiConversationMessageResponse(
        Long id,
        MessageRole role,
        String content,
        LocalDateTime createdAt
) {}