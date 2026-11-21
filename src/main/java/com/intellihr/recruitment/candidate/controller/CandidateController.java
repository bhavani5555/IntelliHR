package com.intellihr.recruitment.candidate.controller;

import com.intellihr.recruitment.candidate.dto.CandidateRegistrationRequest;
import com.intellihr.recruitment.candidate.dto.CandidateRequest;
import com.intellihr.recruitment.candidate.dto.CandidateResponse;
import com.intellihr.recruitment.candidate.service.CandidateService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping("/register")
    public ResponseEntity<CandidateResponse> registerCandidate(
            @Valid @RequestBody CandidateRegistrationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateService.registerCandidate(request));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<CandidateResponse> createCandidate(
            @Valid @RequestBody CandidateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateService.createCandidate(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(candidateService.getCandidateByEmail(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<CandidateResponse>> getAllCandidates() {
        return ResponseEntity.ok(candidateService.getAllCandidates());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<CandidateResponse> getCandidateById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<CandidateResponse> getCandidateByEmail(
            @PathVariable String email
    ) {
        return ResponseEntity.ok(candidateService.getCandidateByEmail(email));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<CandidateResponse>> searchCandidatesByName(
            @RequestParam String name
    ) {
        return ResponseEntity.ok(candidateService.searchCandidatesByName(name));
    }

    @GetMapping("/skills")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<CandidateResponse>> searchCandidatesBySkills(
            @RequestParam String skills
    ) {
        return ResponseEntity.ok(candidateService.searchCandidatesBySkills(skills));
    }

    @GetMapping("/location/{location}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<CandidateResponse>> getCandidatesByLocation(
            @PathVariable String location
    ) {
        return ResponseEntity.ok(candidateService.getCandidatesByLocation(location));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<CandidateResponse> updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CandidateRequest request
    ) {
        return ResponseEntity.ok(candidateService.updateCandidate(id, request));
    }

    @PostMapping(
            value = "/{id}/resume",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<CandidateResponse> uploadResume(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(candidateService.uploadResume(id, file));
    }

    @PostMapping(
            value = "/me/resume",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateResponse> uploadMyResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateService.uploadMyResume(authentication.getName(), file)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }
}
