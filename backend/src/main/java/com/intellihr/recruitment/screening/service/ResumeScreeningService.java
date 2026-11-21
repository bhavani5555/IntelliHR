package com.intellihr.recruitment.screening.service;

import com.intellihr.recruitment.screening.dto.ResumeScreeningResponse;

public interface ResumeScreeningService {

    ResumeScreeningResponse screenResume(Long applicationId);

    ResumeScreeningResponse getScreeningResult(Long applicationId);
}