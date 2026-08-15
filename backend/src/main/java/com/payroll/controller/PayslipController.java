package com.payroll.controller;

import com.payroll.dto.PayslipDTO;
import com.payroll.entity.Payslip;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.repository.PayslipRepository;
import com.payroll.security.UserPrincipal;
import com.payroll.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payslips")
public class PayslipController {

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayslipDTO>> getEmployeePayslips(@PathVariable Long employeeId) {
        validateDataOwnership(employeeId);
        List<Payslip> list = payslipRepository.findByEmployeeId(employeeId);
        List<PayslipDTO> dtos = list.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/download/{payrollId}")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payrollId) {
        Payslip payslip = payslipRepository.findByPayrollId(payrollId)
                .orElseThrow(() -> new RuntimeException("Payslip not found for payroll ID: " + payrollId));

        validateDataOwnership(payslip.getEmployee().getId());

        byte[] pdfBytes = payslip.getPdfData();
        String filename = "Payslip_" + payslip.getPayslipNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    private PayslipDTO convertToDTO(Payslip payslip) {
        PayslipDTO.PayrollSummaryDTO payrollSummary = null;
        if (payslip.getPayroll() != null) {
            payrollSummary = PayslipDTO.PayrollSummaryDTO.builder()
                    .id(payslip.getPayroll().getId())
                    .month(payslip.getPayroll().getMonth())
                    .year(payslip.getPayroll().getYear())
                    .build();
        }

        return PayslipDTO.builder()
                .id(payslip.getId())
                .employeeId(payslip.getEmployee().getId())
                .payslipNumber(payslip.getPayslipNumber())
                .generatedAt(payslip.getGeneratedAt())
                .payroll(payrollSummary)
                .build();
    }

    private void validateDataOwnership(Long employeeId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = principal.getUser();
        
        if (Role.EMPLOYEE.equals(user.getRole())) {
            var employee = employeeService.getEmployeeByUsername(user.getUsername());
            if (!employee.getId().equals(employeeId)) {
                throw new AccessDeniedException("Access Denied: You cannot view or download other employees' payslips.");
            }
        }
    }
}
