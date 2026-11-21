package com.intellihr.auth.runner;

import com.intellihr.auth.entity.User;
import com.intellihr.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class EmployeePasswordResetRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeePasswordResetRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String newPassword = System.getenv("EMPLOYEE_RESET_PASSWORD");

        if (newPassword == null || newPassword.isBlank()) {
            return;
        }

        User user = userRepository.findByEmail("charan@example.com")
                .orElseThrow(() ->
                        new IllegalStateException("Employee user not found")
                );

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("EMPLOYEE PASSWORD RESET SUCCESSFUL");
    }
}
