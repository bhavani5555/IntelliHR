package com.intellihr.ai.service;

import com.intellihr.ai.dto.AiConversationCreateRequest;
import com.intellihr.ai.dto.AiConversationMessageResponse;
import com.intellihr.ai.dto.AiConversationResponse;
import com.intellihr.ai.dto.AiConversationRenameRequest;
import com.intellihr.ai.entity.AiConversation;
import com.intellihr.ai.entity.AiConversationMessage;
import com.intellihr.ai.repository.AiConversationMessageRepository;
import com.intellihr.ai.repository.AiConversationRepository;
import com.intellihr.auth.entity.User;
import com.intellihr.auth.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AiConversationService {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("updatedAt", "createdAt", "title");

    private final AiConversationRepository conversationRepository;
    private final AiConversationMessageRepository messageRepository;
    private final UserRepository userRepository;

    public AiConversationService(
            AiConversationRepository conversationRepository,
            AiConversationMessageRepository messageRepository,
            UserRepository userRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AiConversationResponse createConversation(
            AiConversationCreateRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation = new AiConversation();
        conversation.setUser(user);
        conversation.setTitle(request.title().trim());

        AiConversation saved = conversationRepository.save(conversation);

        return toConversationResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AiConversationResponse> getMyConversations(
            Authentication authentication,
            int page,
            int size,
            String sortBy,
            String direction) {

        User user = getAuthenticatedUser(authentication);

        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page size must be between 1 and 100"
            );
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid sort field. Allowed fields: updatedAt, createdAt, title"
            );
        }

        Sort.Direction sortDirection;

        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Direction must be asc or desc"
            );
        }

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        return conversationRepository
                .findAllByUser_Id(user.getId(), pageable)
                .map(this::toConversationResponse);
    }

    @Transactional(readOnly = true)
    public List<AiConversationMessageResponse> getConversationMessages(
            Long conversationId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation = getOwnedConversation(
                conversationId,
                user.getId()
        );

        return messageRepository
                .findAllByConversation_IdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public Long saveConversationExchange(
            Long conversationId,
            Authentication authentication,
            String question,
            String answer) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation;

        if (conversationId == null) {
            conversation = new AiConversation();
            conversation.setUser(user);
            conversation.setTitle(generateTitle(question));

            conversation = conversationRepository.save(conversation);
        } else {
            conversation = getOwnedConversation(
                    conversationId,
                    user.getId()
            );

            long existingMessages =
                    messageRepository.countByConversation_Id(conversation.getId());

            if (existingMessages == 0) {
                conversation.setTitle(generateTitle(question));
            }
        }

        AiConversationMessage userMessage = new AiConversationMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole(AiConversationMessage.MessageRole.USER);
        userMessage.setContent(question);

        AiConversationMessage assistantMessage = new AiConversationMessage();
        assistantMessage.setConversation(conversation);
        assistantMessage.setRole(AiConversationMessage.MessageRole.ASSISTANT);
        assistantMessage.setContent(answer);

        messageRepository.saveAll(
                List.of(userMessage, assistantMessage)
        );

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return conversation.getId();
    }

    @Transactional
    public AiConversationResponse renameConversation(
            Long conversationId,
            AiConversationRenameRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation = getOwnedConversation(
                conversationId,
                user.getId()
        );

        conversation.setTitle(request.title().trim());

        AiConversation updated = conversationRepository.save(conversation);

        return toConversationResponse(updated);
    }

    private String generateTitle(String question) {

        if (question == null || question.isBlank()) {
            return "New Conversation";
        }

        String title = question.trim().replaceAll("\\s+", " ");

        if (title.length() > 200) {
            title = title.substring(0, 197) + "...";
        }

        return title;
    }

    @Transactional
    public void deleteConversation(
            Long conversationId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation = getOwnedConversation(
                conversationId,
                user.getId()
        );

        messageRepository.deleteAllByConversation_Id(conversation.getId());
        conversationRepository.delete(conversation);
    }

    private User getAuthenticatedUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"
                ));
    }

    private AiConversation getOwnedConversation(
            Long conversationId,
            Long userId) {

        return conversationRepository
                .findByIdAndUser_Id(conversationId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation not found"
                ));
    }

    private AiConversationResponse toConversationResponse(
            AiConversation conversation) {

        long messageCount = messageRepository
                .countByConversation_Id(conversation.getId());

        return new AiConversationResponse(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                messageCount
        );
    }

    private AiConversationMessageResponse toMessageResponse(
            AiConversationMessage message) {

        return new AiConversationMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public Page<AiConversationResponse> searchConversations(
            String keyword,
            Authentication authentication,
            int page,
            int size) {

        User user = getAuthenticatedUser(authentication);

        if (keyword == null || keyword.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Search keyword is required"
            );
        }

        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page size must be between 1 and 100"
            );
        }

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );

        return conversationRepository
                .findAllByUser_IdAndTitleContainingIgnoreCase(
                        user.getId(),
                        keyword.trim(),
                        pageable
                )
                .map(this::toConversationResponse);
    }

    @Transactional
    public void deleteConversationMessage(
            Long conversationId,
            Long messageId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        AiConversation conversation = getOwnedConversation(
                conversationId,
                user.getId()
        );

        AiConversationMessage message = messageRepository
                .findByIdAndConversation_Id(
                        messageId,
                        conversation.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation message not found"
                ));

        messageRepository.delete(message);
    }
}