package com.intellihr.employee.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String department;

    private String designation;

    @Column(length = 10)
    private String phoneNumber;

    private LocalDate dateOfBirth;

    private LocalDate joiningDate;

    @Column(length = 500)
    private String address;

    @Column(nullable = false)
    private boolean active = true;
}
