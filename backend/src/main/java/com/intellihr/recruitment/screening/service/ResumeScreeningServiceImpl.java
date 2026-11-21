package com.intellihr.recruitment.screening.service;

import com.intellihr.recruitment.application.entity.JobApplication;
import com.intellihr.recruitment.application.repository.JobApplicationRepository;
import com.intellihr.recruitment.candidate.entity.Candidate;
import com.intellihr.recruitment.entity.JobOpening;
import com.intellihr.recruitment.screening.dto.ResumeScreeningResponse;
import com.intellihr.recruitment.screening.entity.ResumeScreening;
import com.intellihr.recruitment.screening.repository.ResumeScreeningRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Transactional
public class ResumeScreeningServiceImpl implements ResumeScreeningService {

    private final JobApplicationRepository applicationRepository;
    private final ResumeScreeningRepository screeningRepository;

    public ResumeScreeningServiceImpl(
            JobApplicationRepository applicationRepository,
            ResumeScreeningRepository screeningRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.screeningRepository = screeningRepository;
    }

    @Override
    public ResumeScreeningResponse screenResume(Long applicationId) {

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Job application not found"
                ));

        Candidate candidate = application.getCandidate();
        JobOpening jobOpening = application.getJobOpening();

        String resumeText = candidate.getResumeText();

        final String normalizedResumeText = resumeText == null ? null : resumeText.replaceAll("\\s+", " ").trim();

        if (resumeText == null || resumeText.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please upload the candidate resume before screening"
            );
        }

        String requiredSkills = jobOpening.getRequiredSkills();

        if (requiredSkills == null || requiredSkills.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Required skills are not configured for this job"
            );
        }

        List<String> skills = Arrays.stream(requiredSkills.split("[,;]"))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .distinct()
                .toList();

        if (skills.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No valid required skills found"
            );
        }

        List<String> matchedSkills = skills.stream()
                .filter(skill -> containsSkill(normalizedResumeText, skill))
                .toList();

        List<String> missingSkills = skills.stream()
                .filter(skill -> !containsSkill(normalizedResumeText, skill))
                .toList();

        double matchPercentage = Math.round(
                (matchedSkills.size() * 10000.0) / skills.size()
        ) / 100.0;

        ResumeScreening screening = screeningRepository
                .findByApplicationId(applicationId)
                .orElseGet(ResumeScreening::new);

        screening.setApplication(application);
        screening.setMatchPercentage(matchPercentage);
        screening.setMatchedSkills(String.join(", ", matchedSkills));
        screening.setMissingSkills(String.join(", ", missingSkills));
        screening.setSummary(
                matchedSkills.size() + " out of " + skills.size()
                        + " required skills matched. Match percentage: "
                        + matchPercentage + "%"
        );

        ResumeScreening savedScreening = screeningRepository.save(screening);

        return mapToResponse(savedScreening);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeScreeningResponse getScreeningResult(Long applicationId) {

        ResumeScreening screening = screeningRepository
                .findByApplicationId(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Screening result not found for this application"
                ));

        return mapToResponse(screening);
    }

    private boolean containsSkill(String resumeText, String skill) {

        String regex = "(?i)(?<![a-z0-9])"
                + Pattern.quote(skill.trim())
                + "(?![a-z0-9])";

        return Pattern.compile(regex).matcher(resumeText).find();
    }

    private ResumeScreeningResponse mapToResponse(ResumeScreening screening) {

        JobApplication application = screening.getApplication();
        Candidate candidate = application.getCandidate();
        JobOpening jobOpening = application.getJobOpening();

        return new ResumeScreeningResponse(
                screening.getId(),
                application.getId(),
                candidate.getId(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                jobOpening.getId(),
                jobOpening.getTitle(),
                screening.getMatchPercentage(),
                splitSkills(screening.getMatchedSkills()),
                splitSkills(screening.getMissingSkills()),
                screening.getSummary(),
                screening.getScreenedAt()
        );
    }

    private List<String> splitSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }

        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .toList();
    }
}