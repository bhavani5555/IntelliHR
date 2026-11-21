package com.intellihr.auth.runner;

import com.intellihr.auth.entity.User;
import com.intellihr.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class HrPasswordResetRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public HrPasswordResetRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String newPassword = System.getenv("HR_RESET_PASSWORD");

        if (newPassword == null || newPassword.isBlank()) {
            return;
        }

        User user = userRepository.findByEmail("hr@intellihr.com")
                .orElseThrow(() ->
                        new IllegalStateException("HR user not found")
                );

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("HR PASSWORD RESET SUCCESSFUL");
    }
}
