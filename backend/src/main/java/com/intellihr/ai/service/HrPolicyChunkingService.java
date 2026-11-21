package com.intellihr.ai.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HrPolicyChunkingService {

    private static final int CHUNK_SIZE = 1000;
    private static final int CHUNK_OVERLAP = 200;

    public List<String> splitIntoChunks(String text) {

        List<String> chunks = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        String cleanedText = text
                .replaceAll("[\\t\\x0B\\f\\r]+", " ")
                .replaceAll(" +", " ")
                .trim();

        int start = 0;

        while (start < cleanedText.length()) {

            int end = Math.min(
                    start + CHUNK_SIZE,
                    cleanedText.length()
            );

            if (end < cleanedText.length()) {
                int paragraphBreak = cleanedText.lastIndexOf("\n", end);

                if (paragraphBreak > start + CHUNK_SIZE / 2) {
                    end = paragraphBreak;
                } else {
                    int wordBreak = cleanedText.lastIndexOf(" ", end);

                    if (wordBreak > start + CHUNK_SIZE / 2) {
                        end = wordBreak;
                    }
                }
            }

            String chunk = cleanedText.substring(start, end).trim();

            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }

            if (end >= cleanedText.length()) {
                break;
            }

            start = Math.max(end - CHUNK_OVERLAP, start + 1);
        }

        return chunks;
    }
}
