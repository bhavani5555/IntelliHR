package com.intellihr.ai.repository;

import com.intellihr.ai.entity.AiConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiConversationRepository
        extends JpaRepository<AiConversation, Long> {

    Page<AiConversation> findAllByUser_Id(
            Long userId,
            Pageable pageable
    );

    Page<AiConversation> findAllByUser_IdAndTitleContainingIgnoreCase(
            Long userId,
            String title,
            Pageable pageable
    );

    Optional<AiConversation> findByIdAndUser_Id(
            Long conversationId,
            Long userId
    );

    void deleteByIdAndUser_Id(Long conversationId, Long userId);
}