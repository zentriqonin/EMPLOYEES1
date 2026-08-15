package com.payroll.controller;

import com.payroll.dto.PayrollDTO;
import com.payroll.dto.PayrollRunRequest;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.EmployeeService;
import com.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/calculate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<PayrollDTO> calculatePayroll(@Valid @RequestBody PayrollRunRequest request) {
        if (request.getEmployeeId() == null) {
            throw new RuntimeException("Employee ID is required to calculate single payroll.");
        }
        PayrollDTO result = payrollService.calculatePayroll(request.getEmployeeId(), request.getMonth(), request.getYear());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/run-all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<PayrollDTO>> runPayrollForAll(@Valid @RequestBody PayrollRunRequest request) {
        List<PayrollDTO> results = payrollService.runPayrollForAll(request.getMonth(), request.getYear());
        return ResponseEntity.ok(results);
    }

    @PostMapping("/pay/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<PayrollDTO> payPayroll(@PathVariable Long id) {
        PayrollDTO result = payrollService.markAsPaid(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollDTO>> getByEmployee(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(payrollService.getPayrollHistoryByEmployee(employeeId));
    }

    @GetMapping("/query")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<PayrollDTO>> queryPayrolls(@RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollByMonthAndYear(month, year));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDTO> getById(@PathVariable Long id) {
        PayrollDTO dto = payrollService.getPayrollById(id);
        validateDataOwnership(dto.getEmployeeId());
        return ResponseEntity.ok(dto);
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view payroll records for another employee.");
            }
        }
    }
}
