package com.intellihr.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellihr.ai.entity.HrPolicyChunk;
import com.intellihr.ai.entity.HrPolicyDocument;
import com.intellihr.ai.repository.HrPolicyChunkRepository;
import com.intellihr.ai.repository.HrPolicyDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HrPolicyStorageService {

    private final HrPolicyDocumentRepository documentRepository;
    private final HrPolicyChunkRepository chunkRepository;
    private final ObjectMapper objectMapper;

    public HrPolicyStorageService(
            HrPolicyDocumentRepository documentRepository,
            HrPolicyChunkRepository chunkRepository,
            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public HrPolicyDocument savePolicy(
            HrPolicyDocument document,
            List<String> chunks,
            List<float[]> embeddings) {

        if (chunks == null || embeddings == null ||
                chunks.size() != embeddings.size()) {
            throw new IllegalArgumentException(
                    "Chunks and embeddings must have matching sizes"
            );
        }

        HrPolicyDocument savedDocument =
                documentRepository.save(document);

        for (int i = 0; i < chunks.size(); i++) {

            HrPolicyChunk chunk = new HrPolicyChunk();

            chunk.setPolicyDocument(savedDocument);
            chunk.setChunkIndex(i);
            chunk.setContent(chunks.get(i));

            try {
                chunk.setEmbeddingJson(
                        objectMapper.writeValueAsString(embeddings.get(i))
                );
            } catch (JsonProcessingException exception) {
                throw new IllegalStateException(
                        "Unable to serialize policy embedding", exception
                );
            }

            chunkRepository.save(chunk);
        }

        savedDocument.setTotalChunks(chunks.size());

        return documentRepository.save(savedDocument);
    }

    @Transactional
    public void deletePolicy(Long documentId) {

        HrPolicyDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "HR policy document not found"
                ));

        chunkRepository.deleteByPolicyDocumentId(document.getId());
        documentRepository.delete(document);
    }}
