package com.payroll.controller;

import com.payroll.dto.SalaryStructureDTO;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.EmployeeService;
import com.payroll.service.SalaryStructureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/salaries")
public class SalaryStructureController {

    @Autowired
    private SalaryStructureService salaryStructureService;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<SalaryStructureDTO> getStructureByEmployee(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(salaryStructureService.getSalaryStructureByEmployeeId(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<SalaryStructureDTO> saveStructure(@Valid @RequestBody SalaryStructureDTO dto) {
        return ResponseEntity.ok(salaryStructureService.saveSalaryStructure(dto));
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view salary details of other employees.");
            }
        }
    }
}
