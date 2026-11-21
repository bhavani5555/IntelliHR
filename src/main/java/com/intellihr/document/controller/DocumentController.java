package com.intellihr.document.controller;

import com.intellihr.document.dto.DocumentDownload;
import com.intellihr.document.dto.EmployeeDocumentResponse;
import com.intellihr.document.repository.EmployeeDocumentRepository;
import com.intellihr.document.service.EmployeeDocumentService;
import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class DocumentController {

    private final EmployeeDocumentService documentService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository documentRepository;

    public DocumentController(
            EmployeeDocumentService documentService,
            EmployeeRepository employeeRepository,
            EmployeeDocumentRepository documentRepository
    ) {
        this.documentService = documentService;
        this.employeeRepository = employeeRepository;
        this.documentRepository = documentRepository;
    }

    @PostMapping(
            value = "/api/employees/{employeeId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDocumentResponse> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file
    ) {
        EmployeeDocumentResponse response =
                documentService.uploadDocument(employeeId, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeDocumentResponse>> getEmployeeDocuments(
            @PathVariable Long employeeId,
            Authentication authentication
    ) {
        checkEmployeeOwnership(employeeId, authentication);

        return ResponseEntity.ok(
                documentService.getEmployeeDocuments(employeeId)
        );
    }

    @GetMapping("/api/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        checkDocumentOwnership(documentId, authentication);

        DocumentDownload download =
                documentService.downloadDocument(documentId);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.originalFileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(download.resource());
    }

    @DeleteMapping("/api/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId
    ) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    private void checkEmployeeOwnership(
            Long employeeId,
            Authentication authentication
    ) {
        if (isPrivileged(authentication)) {
            return;
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (!employee.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can access only your own documents"
            );
        }
    }

    private void checkDocumentOwnership(
            Long documentId,
            Authentication authentication
    ) {
        if (isPrivileged(authentication)) {
            return;
        }

        if (!documentRepository.existsById(documentId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found"
            );
        }

        if (!documentRepository.existsByIdAndEmployee_EmailIgnoreCase(
                documentId,
                authentication.getName()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can download only your own documents"
            );
        }
    }

    private boolean isPrivileged(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_HR")
                );
    }
}
