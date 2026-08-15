package com.payroll.controller;

import com.payroll.dto.AttendanceDTO;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.security.UserPrincipal;
import com.payroll.service.AttendanceService;
import com.payroll.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<AttendanceDTO>> getHistory(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        validateDataOwnership(employeeId);
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(employeeId, start, end));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<AttendanceDTO>> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceForDate(date));
    }

    @PostMapping
    public ResponseEntity<AttendanceDTO> markAttendance(@Valid @RequestBody AttendanceDTO dto) {
        validateDataOwnership(dto.getEmployeeId());
        return ResponseEntity.ok(attendanceService.markAttendance(dto));
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view or modify other employees' attendance.");
            }
        }
    }
}
