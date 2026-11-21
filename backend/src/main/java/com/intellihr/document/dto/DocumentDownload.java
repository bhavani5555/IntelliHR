package com.intellihr.document.dto;

import org.springframework.core.io.Resource;

public record DocumentDownload(

    Resource resource,
    String originalFileName,
    String contentType

) {}
