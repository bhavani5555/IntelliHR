package com.intellihr.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class HrAssistantService {

    private final ChatClient chatClient;

    public HrAssistantService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String askQuestion(String question) {

        return chatClient.prompt()
                .system("""
                        You are IntelliHR, a professional HR assistant.

                        Your responsibilities:
                        1. Answer employee HR-related questions clearly.
                        2. Use simple, professional language.
                        3. Keep answers helpful and concise.
                        4. Do not invent company-specific policies, benefits,
                           leave rules, salary details, or procedures.
                        5. If a question requires company-specific information,
                           clearly explain that the official HR policy document
                           is needed to provide an accurate answer.
                        6. If a question is unrelated to HR, politely guide
                           the employee back to HR-related topics.
                        """)
                .user(question)
                .call()
                .content();
    }
}
