package com.intellihr.ai.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfTextExtractionService {

    public String extractText(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF file cannot be empty");
        }

        String filename = file.getOriginalFilename();

        if (filename == null ||
                !filename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        try {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            PagePdfDocumentReader reader =
                    new PagePdfDocumentReader(resource);

            List<Document> documents = reader.read();

            String extractedText = documents.stream()
                    .map(Document::getText)
                    .filter(text -> text != null && !text.isBlank())
                    .collect(Collectors.joining("\n\n"));

            if (extractedText.isBlank()) {
                throw new IllegalArgumentException(
                        "No readable text found in the PDF"
                );
            }

            return extractedText;

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to read the PDF file", exception
            );
        }
    }
}
