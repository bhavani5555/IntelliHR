package com.intellihr.ai.service;

import com.intellihr.ai.entity.HrPolicyDocument;
import com.intellihr.ai.repository.HrPolicyDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class HrPolicyIngestionService {

    private final PdfTextExtractionService pdfTextExtractionService;
    private final HrPolicyChunkingService chunkingService;
    private final HrPolicyEmbeddingService embeddingService;
    private final HrPolicyStorageService storageService;
    private final HrPolicyDocumentRepository documentRepository;

    public HrPolicyIngestionService(
            PdfTextExtractionService pdfTextExtractionService,
            HrPolicyChunkingService chunkingService,
            HrPolicyEmbeddingService embeddingService,
            HrPolicyStorageService storageService,
            HrPolicyDocumentRepository documentRepository) {

        this.pdfTextExtractionService = pdfTextExtractionService;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.storageService = storageService;
        this.documentRepository = documentRepository;
    }

    @Transactional
    public HrPolicyDocument ingestPdf(MultipartFile file) {

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException(
                    "PDF file name is required"
            );
        }

        if (documentRepository
                .findByOriginalFileNameIgnoreCase(originalFileName)
                .isPresent()) {
            throw new IllegalArgumentException(
                    "A policy document with this file name already exists"
            );
        }

        String extractedText =
                pdfTextExtractionService.extractText(file);

        List<String> chunks =
                chunkingService.splitIntoChunks(extractedText);

        if (chunks.isEmpty()) {
            throw new IllegalArgumentException(
                    "No readable policy content found in the PDF"
            );
        }

        List<float[]> embeddings = new ArrayList<>();

        for (String chunk : chunks) {
            embeddings.add(
                    embeddingService.generateEmbedding(chunk)
            );
        }

        HrPolicyDocument document = new HrPolicyDocument();

        document.setOriginalFileName(originalFileName);
        document.setStoredFileName(originalFileName);
        document.setContentType("application/pdf");
        document.setFileSize(file.getSize());
        document.setTotalChunks(chunks.size());

        return storageService.savePolicy(
                document,
                chunks,
                embeddings
        );
    }

    @Transactional(readOnly = true)
    public List<HrPolicyDocument> getAllPolicyDocuments() {
        return documentRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC,
                        "uploadedAt"
                )
        );
    }
    @Transactional
    public void deletePolicyDocument(Long documentId) {

        if (!documentRepository.existsById(documentId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "HR policy document not found"
            );
        }

        storageService.deletePolicy(documentId);
    }}
