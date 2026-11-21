package com.intellihr.ai.controller;

import com.intellihr.ai.dto.HrPolicyDocumentResponse;
import com.intellihr.ai.dto.HrPolicyUploadResponse;
import com.intellihr.ai.entity.HrPolicyDocument;
import com.intellihr.ai.service.HrPolicyIngestionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai/hr-policies")
public class HrPolicyUploadController {

    private final HrPolicyIngestionService ingestionService;

    public HrPolicyUploadController(
            HrPolicyIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<HrPolicyUploadResponse> uploadPolicy(
            @RequestParam("file") MultipartFile file) {

        HrPolicyDocument document =
                ingestionService.ingestPdf(file);

        HrPolicyUploadResponse response =
                new HrPolicyUploadResponse(
                        document.getId(),
                        document.getOriginalFileName(),
                        document.getFileSize(),
                        document.getTotalChunks(),
                        document.getUploadedAt(),
                        "HR policy uploaded and processed successfully"
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<HrPolicyDocumentResponse>> getAllPolicyDocuments() {

        List<HrPolicyDocumentResponse> documents =
                ingestionService.getAllPolicyDocuments()
                        .stream()
                        .map(document -> new HrPolicyDocumentResponse(
                                document.getId(),
                                document.getOriginalFileName(),
                                document.getFileSize(),
                                document.getTotalChunks(),
                                document.getUploadedAt()
                        ))
                        .toList();

        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Void> deletePolicyDocument(
            @PathVariable Long documentId) {

        ingestionService.deletePolicyDocument(documentId);

        return ResponseEntity.noContent().build();
    }}