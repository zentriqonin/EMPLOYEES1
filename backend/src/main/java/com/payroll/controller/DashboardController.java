package com.payroll.controller;

import com.payroll.dto.AdminDashboardDTO;
import com.payroll.dto.EmployeeDashboardDTO;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.DashboardService;
import com.payroll.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<AdminDashboardDTO> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardData());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<EmployeeDashboardDTO> getEmployeeDashboard(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(dashboardService.getEmployeeDashboardData(employeeId));
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view dashboards belonging to other employees.");
            }
        }
    }
}
