package com.payroll.controller;

import com.payroll.dto.LeaveApprovalRequest;
import com.payroll.dto.LeaveRequestDTO;
import com.payroll.entity.LeaveBalance;
import com.payroll.entity.LeaveType;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.EmployeeService;
import com.payroll.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/balances/{employeeId}")
    public ResponseEntity<List<LeaveBalance>> getBalances(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(leaveService.getLeaveBalances(employeeId));
    }

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<LeaveRequestDTO>> getHistory(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(leaveService.getLeaveHistory(employeeId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(leaveService.getPendingLeaveRequests());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDTO> applyLeave(@Valid @RequestBody LeaveRequestDTO dto) {
        validateDataOwnership(dto.getEmployeeId());
        return ResponseEntity.ok(leaveService.applyLeave(dto));
    }

    @PostMapping("/approve/{requestId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveRequestDTO> approveLeave(@PathVariable Long requestId, @Valid @RequestBody LeaveApprovalRequest approval) {
        return ResponseEntity.ok(leaveService.approveOrRejectLeave(requestId, approval));
    }

    @GetMapping("/types")
    public ResponseEntity<List<LeaveType>> getTypes() {
        return ResponseEntity.ok(leaveService.getAllLeaveTypes());
    }

    @PostMapping("/types")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> createType(@Valid @RequestBody LeaveType type) {
        return ResponseEntity.ok(leaveService.createLeaveType(type));
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view or request leaves for another employee.");
            }
        }
    }
}
