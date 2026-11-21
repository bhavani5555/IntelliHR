package com.intellihr.recruitment.candidate.service;

import com.intellihr.ai.service.PdfTextExtractionService;
import com.intellihr.auth.entity.User;
import com.intellihr.auth.entity.UserRole;
import com.intellihr.auth.repository.UserRepository;
import com.intellihr.recruitment.candidate.dto.CandidateRegistrationRequest;
import com.intellihr.recruitment.candidate.dto.CandidateRequest;
import com.intellihr.recruitment.candidate.dto.CandidateResponse;
import com.intellihr.recruitment.candidate.entity.Candidate;
import com.intellihr.recruitment.candidate.repository.CandidateRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final ResumeStorageService resumeStorageService;
    private final PdfTextExtractionService pdfTextExtractionService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CandidateServiceImpl(
            CandidateRepository candidateRepository,
            ResumeStorageService resumeStorageService,
            PdfTextExtractionService pdfTextExtractionService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.candidateRepository = candidateRepository;
        this.resumeStorageService = resumeStorageService;
        this.pdfTextExtractionService = pdfTextExtractionService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public CandidateResponse registerCandidate(
            CandidateRegistrationRequest request
    ) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)
                || userRepository.existsByUsername(email)
                || candidateRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists"
            );
        }

        User user = new User();
        user.setUsername(email);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CANDIDATE);

        userRepository.save(user);

        Candidate candidate = new Candidate();
        candidate.setFirstName(request.firstName().trim());
        candidate.setLastName(request.lastName().trim());
        candidate.setEmail(email);
        candidate.setPhoneNumber(request.phoneNumber().trim());
        candidate.setCurrentLocation(request.currentLocation());
        candidate.setYearsOfExperience(request.yearsOfExperience());
        candidate.setSkills(request.skills());
        candidate.setHighestQualification(request.highestQualification());

        Candidate savedCandidate = candidateRepository.save(candidate);

        return mapToResponse(savedCandidate);
    }

    @Override
    public CandidateResponse createCandidate(CandidateRequest request) {

        if (candidateRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Candidate with this email already exists"
            );
        }

        Candidate candidate = new Candidate();
        updateCandidateFields(candidate, request);

        return mapToResponse(candidateRepository.save(candidate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> getAllCandidates() {
        return candidateRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse getCandidateById(Long id) {
        return mapToResponse(findCandidate(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse getCandidateByEmail(String email) {

        Candidate candidate = candidateRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate not found with email: " + email
                ));

        return mapToResponse(candidate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> searchCandidatesByName(String name) {
        return candidateRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        name.trim(), name.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> searchCandidatesBySkills(String skills) {
        return candidateRepository.findBySkillsContainingIgnoreCase(skills.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> getCandidatesByLocation(String location) {
        return candidateRepository.findByCurrentLocationIgnoreCase(location.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CandidateResponse updateCandidate(Long id, CandidateRequest request) {

        Candidate candidate = findCandidate(id);

        candidateRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Email is already used by another candidate"
                    );
                });

        updateCandidateFields(candidate, request);
        candidate.setUpdatedAt(LocalDateTime.now());

        candidateRepository.saveAndFlush(candidate);

        return mapToResponse(candidate);
    }

    @Override
    public CandidateResponse uploadResume(Long id, MultipartFile file) {

        Candidate candidate = findCandidate(id);

        String extractedText = pdfTextExtractionService.extractText(file);
        String storedFilename = resumeStorageService.storeResume(file);

        candidate.setResumeFileName(storedFilename);
        candidate.setResumeText(extractedText);
        candidate.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(candidateRepository.save(candidate));
    }

    @Override
    public CandidateResponse uploadMyResume(String email, MultipartFile file) {

        Candidate candidate = candidateRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate profile not found"
                ));

        return uploadResume(candidate.getId(), file);
    }

    @Override
    public void deleteCandidate(Long id) {
        Candidate candidate = findCandidate(id);
        candidateRepository.delete(candidate);
    }

    private Candidate findCandidate(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate not found with id: " + id
                ));
    }

    private void updateCandidateFields(
            Candidate candidate,
            CandidateRequest request
    ) {
        candidate.setFirstName(request.firstName().trim());
        candidate.setLastName(request.lastName().trim());
        candidate.setEmail(request.email().trim().toLowerCase());
        candidate.setPhoneNumber(request.phoneNumber().trim());
        candidate.setCurrentLocation(request.currentLocation());
        candidate.setYearsOfExperience(request.yearsOfExperience());
        candidate.setSkills(request.skills());
        candidate.setHighestQualification(request.highestQualification());
        candidate.setResumeFileName(request.resumeFileName());
    }

    private CandidateResponse mapToResponse(Candidate candidate) {
        return new CandidateResponse(
                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getEmail(),
                candidate.getPhoneNumber(),
                candidate.getCurrentLocation(),
                candidate.getYearsOfExperience(),
                candidate.getSkills(),
                candidate.getHighestQualification(),
                candidate.getResumeFileName(),
                candidate.getCreatedAt(),
                candidate.getUpdatedAt()
        );
    }
}
