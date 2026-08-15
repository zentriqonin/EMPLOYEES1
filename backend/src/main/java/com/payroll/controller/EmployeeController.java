package com.payroll.controller;

import com.payroll.dto.EmployeeDTO;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        validateDataOwnership(id);
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMyProfile() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(employeeService.getEmployeeByUsername(principal.getUsername()));
    }

    @GetMapping("/department")
    public ResponseEntity<List<EmployeeDTO>> getDepartmentEmployees() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        EmployeeDTO currentUser = employeeService.getEmployeeByUsername(principal.getUsername());
        
        List<EmployeeDTO> deptEmployees = employeeService.getAllEmployees().stream()
                .filter(e -> currentUser.getDepartment().equals(e.getDepartment()))
                .toList();
                
        return ResponseEntity.ok(deptEmployees);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            EmployeeDTO employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You are not authorized to view another employee's records.");
            }
        }
    }
}
