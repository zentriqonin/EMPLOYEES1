package com.payroll.controller;

import com.payroll.dto.AuthResponse;
import com.payroll.dto.EmployeeDTO;
import com.payroll.dto.LoginRequest;
import com.payroll.service.AuthService;
import com.payroll.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, jakarta.servlet.http.HttpServletResponse httpServletResponse) {
        AuthResponse response = authService.login(loginRequest);
        
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt_token", response.getToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1 day
        httpServletResponse.addCookie(cookie);
        
        response.setToken(null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(jakarta.servlet.http.HttpServletResponse httpServletResponse) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        httpServletResponse.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        AuthResponse response = authService.getMe(authentication);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeDTO> registerEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        EmployeeDTO result = employeeService.createEmployee(employeeDTO);
        return ResponseEntity.ok(result);
    }
}
