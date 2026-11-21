package com.intellihr.recruitment.candidate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CandidateRegistrationRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must contain 8 to 72 characters")
        String password,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10,15}$",
                message = "Phone number must contain 10 to 15 digits")
        String phoneNumber,

        @Size(max = 150)
        String currentLocation,

        @NotNull(message = "Years of experience is required")
        @Min(value = 0, message = "Experience cannot be negative")
        Integer yearsOfExperience,

        @Size(max = 3000)
        String skills,

        @Size(max = 150)
        String highestQualification

) {}
