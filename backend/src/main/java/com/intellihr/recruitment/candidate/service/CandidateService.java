package com.intellihr.recruitment.candidate.service;

import com.intellihr.recruitment.candidate.dto.CandidateRegistrationRequest;
import com.intellihr.recruitment.candidate.dto.CandidateRequest;
import com.intellihr.recruitment.candidate.dto.CandidateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CandidateService {

    CandidateResponse registerCandidate(CandidateRegistrationRequest request);

    CandidateResponse createCandidate(CandidateRequest request);

    List<CandidateResponse> getAllCandidates();

    CandidateResponse getCandidateById(Long id);

    CandidateResponse getCandidateByEmail(String email);

    List<CandidateResponse> searchCandidatesByName(String name);

    List<CandidateResponse> searchCandidatesBySkills(String skills);

    List<CandidateResponse> getCandidatesByLocation(String location);

    CandidateResponse updateCandidate(Long id, CandidateRequest request);

    CandidateResponse uploadResume(Long id, MultipartFile file);

    CandidateResponse uploadMyResume(String email, MultipartFile file);

    void deleteCandidate(Long id);
}
