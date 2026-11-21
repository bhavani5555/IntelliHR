package com.intellihr.document.service;

import com.intellihr.document.dto.DocumentDownload;
import com.intellihr.document.dto.EmployeeDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EmployeeDocumentService {

    EmployeeDocumentResponse uploadDocument(
            Long employeeId,
            MultipartFile file
    );

    List<EmployeeDocumentResponse> getEmployeeDocuments(Long employeeId);

    DocumentDownload downloadDocument(Long documentId);

    void deleteDocument(Long documentId);
}
