package com.intellihr.ai.controller;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class EmbeddingTestController {

    private final EmbeddingModel embeddingModel;

    public EmbeddingTestController(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    @GetMapping("/embedding-test")
    public Map<String, Object> testEmbedding() {

        float[] embedding = embeddingModel.embed(
                "Annual leave allows employees to take time away from work."
        );

        return Map.of(
                "status", "success",
                "model", "gemini-embedding-001",
                "dimensions", embedding.length,
                "message", "Gemini embedding generated successfully"
        );
    }
}
