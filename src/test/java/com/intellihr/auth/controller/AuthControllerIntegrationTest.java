package com.intellihr.auth.controller;

import com.intellihr.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminShouldBeAllowedToUpdateUserRole() throws Exception {

        Long userId = userRepository.findAll().stream()
                .filter(user -> user.getEmail().equals("charan@example.com"))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(put("/api/auth/users/{userId}/role", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "role": "EMPLOYEE"
                        }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "HR")
    void hrShouldNotBeAllowedToUpdateUserRole() throws Exception {

        mockMvc.perform(put("/api/auth/users/1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "role": "EMPLOYEE"
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeShouldNotBeAllowedToUpdateUserRole() throws Exception {

        mockMvc.perform(put("/api/auth/users/1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "role": "HR"
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void invalidRoleShouldReturnBadRequest() throws Exception {

        mockMvc.perform(put("/api/auth/users/1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "role": "MANAGER"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void missingRoleShouldReturnBadRequest() throws Exception {

        mockMvc.perform(put("/api/auth/users/1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "role": null
                        }
                        """))
                .andExpect(status().isBadRequest());
    }
}
