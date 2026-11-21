package com.intellihr.ai.repository;

import com.intellihr.ai.entity.AiConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiConversationMessageRepository
        extends JpaRepository<AiConversationMessage, Long> {

    List<AiConversationMessage> findAllByConversation_IdOrderByCreatedAtAsc(
            Long conversationId
    );

    Optional<AiConversationMessage> findByIdAndConversation_Id(
            Long messageId,
            Long conversationId
    );

    long countByConversation_Id(Long conversationId);

    void deleteAllByConversation_Id(Long conversationId);
}