package com.intellihr.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellihr.ai.entity.HrPolicyChunk;
import com.intellihr.ai.repository.HrPolicyChunkRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class HrPolicyRetrievalService {

    private final HrPolicyChunkRepository chunkRepository;
    private final HrPolicyEmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public HrPolicyRetrievalService(
            HrPolicyChunkRepository chunkRepository,
            HrPolicyEmbeddingService embeddingService,
            ObjectMapper objectMapper) {

        this.chunkRepository = chunkRepository;
        this.embeddingService = embeddingService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<RetrievedChunk> retrieveRelevantChunks(
            String question,
            int topK) {

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException(
                    "Question cannot be empty"
            );
        }

        if (topK < 1) {
            throw new IllegalArgumentException(
                    "topK must be greater than zero"
            );
        }

        float[] queryEmbedding =
                embeddingService.generateEmbedding(question);

        List<HrPolicyChunk> storedChunks =
                chunkRepository.findAll();

        return storedChunks.stream()
                .map(chunk -> {

                    float[] storedEmbedding =
                            deserializeEmbedding(chunk.getEmbeddingJson());

                    double similarity =
                            cosineSimilarity(
                                    queryEmbedding,
                                    storedEmbedding
                            );

                    return new RetrievedChunk(
                            chunk.getPolicyDocument()
                                    .getOriginalFileName(),
                            chunk.getChunkIndex(),
                            chunk.getContent(),
                            similarity
                    );
                })
                .sorted(
                        Comparator.comparingDouble(
                                RetrievedChunk::similarityScore
                        ).reversed()
                )
                .limit(topK)
                .toList();
    }

    private float[] deserializeEmbedding(String embeddingJson) {

        try {
            return objectMapper.readValue(
                    embeddingJson,
                    float[].class
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Failed to deserialize stored policy embedding",
                    exception
            );
        }
    }

    private double cosineSimilarity(
            float[] vectorA,
            float[] vectorB) {

        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException(
                    "Embedding dimensions do not match"
            );
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {

            dotProduct += vectorA[i] * vectorB[i];

            magnitudeA += vectorA[i] * vectorA[i];

            magnitudeB += vectorB[i] * vectorB[i];
        }

        if (magnitudeA == 0.0 || magnitudeB == 0.0) {
            return 0.0;
        }

        return dotProduct /
                (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    }

    public record RetrievedChunk(
            String fileName,
            Integer chunkIndex,
            String content,
            double similarityScore
    ) {
    }
}
