package com.intellihr.ai.service;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

@Service
public class HrPolicyEmbeddingService {

    private final EmbeddingModel embeddingModel;

    public HrPolicyEmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public float[] generateEmbedding(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Text cannot be empty for embedding generation"
            );
        }

        return embeddingModel.embed(text);
    }
}
