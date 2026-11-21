package com.intellihr.ai.controller;

import com.intellihr.ai.dto.AiConversationCreateRequest;
import com.intellihr.ai.dto.AiConversationMessageResponse;
import com.intellihr.ai.dto.AiConversationResponse;
import com.intellihr.ai.dto.AiConversationRenameRequest;
import com.intellihr.ai.service.AiConversationService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/conversations")
public class AiConversationController {

    private final AiConversationService conversationService;

    public AiConversationController(
            AiConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<AiConversationResponse> createConversation(
            @Valid @RequestBody AiConversationCreateRequest request,
            Authentication authentication) {

        AiConversationResponse response =
                conversationService.createConversation(request, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<AiConversationResponse>> getMyConversations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(
                conversationService.getMyConversations(
                        authentication,
                        page,
                        size,
                        sortBy,
                        direction
                )
        );
    }


    @PatchMapping("/{conversationId}/title")
    public ResponseEntity<AiConversationResponse> renameConversation(
            @PathVariable Long conversationId,
            @Valid @RequestBody AiConversationRenameRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                conversationService.renameConversation(
                        conversationId, request, authentication)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AiConversationResponse>> searchConversations(
            @RequestParam String keyword,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                conversationService.searchConversations(
                        keyword,
                        authentication,
                        page,
                        size
                )
        );
    }
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<AiConversationMessageResponse>> getConversationMessages(
            @PathVariable Long conversationId,
            Authentication authentication) {

        return ResponseEntity.ok(
                conversationService.getConversationMessages(
                        conversationId, authentication)
        );
    }


    @DeleteMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<Void> deleteConversationMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            Authentication authentication) {

        conversationService.deleteConversationMessage(
                conversationId, messageId, authentication);

        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {

        conversationService.deleteConversation(
                conversationId, authentication);

        return ResponseEntity.noContent().build();
    }
}