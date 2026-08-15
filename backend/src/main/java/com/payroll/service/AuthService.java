package com.payroll.service;

import com.payroll.dto.AuthResponse;
import com.payroll.dto.LoginRequest;
import com.payroll.entity.Employee;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.UserRepository;
import com.payroll.security.JwtTokenProvider;
import com.payroll.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        AuthResponse response = getMe(authentication);
        response.setToken(jwt);
        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        // Check if there is an employee profile linked to this user account
        Long employeeId = null;
        Optional<Employee> employeeOpt = employeeRepository.findByUserUsername(user.getUsername());
        if (employeeOpt.isPresent()) {
            employeeId = employeeOpt.get().getId();
        }

        return new AuthResponse(
                null,
                user.getUsername(),
                user.getRole().name(),
                user.getId(),
                employeeId
        );
    }

    @Transactional
    public User registerUser(String username, String password, Role role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists!");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();

        return userRepository.save(user);
    }
}
