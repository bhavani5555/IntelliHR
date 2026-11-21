package com.intellihr.ai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class GeminiConnectionTestController {

    private final ChatClient chatClient;

    public GeminiConnectionTestController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/connection-test")
    public String testGeminiConnection() {

        return chatClient.prompt()
                .user("Reply with exactly: Gemini connection successful!")
                .call()
                .content();
    }
}
