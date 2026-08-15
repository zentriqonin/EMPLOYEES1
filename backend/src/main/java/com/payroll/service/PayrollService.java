package com.payroll.service;

import com.payroll.dto.PayrollDTO;
import com.payroll.entity.*;
import com.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private DeductionRepository deductionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private PayslipService payslipService;

    @Transactional(readOnly = true)
    public List<PayrollDTO> getPayrollHistoryByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayrollDTO> getPayrollByMonthAndYear(Integer month, Integer year) {
        return payrollRepository.findByMonthAndYear(month, year).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayrollDTO getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found with ID: " + id));
        return convertToDTO(payroll);
    }

    @Transactional
    public PayrollDTO calculatePayroll(Long employeeId, Integer month, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Salary structure not configured for employee: " + employee.getFirstName() + " " + employee.getLastName()));

        // Check if payroll already exists and is paid
        Optional<Payroll> existingOpt = payrollRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
        if (existingOpt.isPresent() && "PAID".equals(existingOpt.get().getStatus())) {
            throw new RuntimeException("Payroll is already processed and PAID for " + month + "/" + year);
        }

        // 1. Calculate calendar days
        YearMonth yearMonth = YearMonth.of(year, month);
        int totalDays = yearMonth.lengthOfMonth();

        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        // 2. Count attendance logs
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startOfMonth, endOfMonth);
        
        double leaveDays = 0.0;
        double absentDays = 0.0;

        for (Attendance att : attendances) {
            String status = att.getStatus().toUpperCase();
            if ("LEAVE".equals(status)) {
                leaveDays += 1.0;
            } else if ("ABSENT".equals(status)) {
                absentDays += 1.0;
            } else if ("HALF_DAY".equals(status)) {
                absentDays += 0.5;
                // Note: The remaining 0.5 is automatically counted as present in the calculations
            }
        }

        // Present days is the rest of the calendar days
        double presentDays = totalDays - leaveDays - absentDays;

        // 3. Compute Proration Factor
        // Leaves are paid, so proration factor = (present + leave) / total
        double prorationFactor = (presentDays + leaveDays) / totalDays;
        BigDecimal prorationMultiplier = BigDecimal.valueOf(prorationFactor);

        // 4. Calculate Prorated Earnings
        BigDecimal proratedBasic = structure.getBasicSalary().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal proratedHra = structure.getHra().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal proratedDa = structure.getDa().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal proratedConveyance = structure.getConveyance().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal proratedMedical = structure.getMedical().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal proratedOtherAllowances = structure.getOtherAllowances().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);

        BigDecimal grossSalary = proratedBasic.add(proratedHra).add(proratedDa)
                .add(proratedConveyance).add(proratedMedical).add(proratedOtherAllowances);

        // 5. Calculate Prorated/Fixed Deductions
        // PF is prorated because it depends on basic salary earned
        BigDecimal proratedPf = structure.getPf().multiply(prorationMultiplier).setScale(2, RoundingMode.HALF_UP);
        
        // Fixed deductions (applied in full regardless of leaves)
        BigDecimal professionalTax = structure.getProfessionalTax();
        BigDecimal incomeTax = structure.getIncomeTax();
        BigDecimal loanEmi = structure.getLoanEmi();
        BigDecimal otherDeductions = BigDecimal.ZERO;

        BigDecimal totalDeductions = proratedPf.add(professionalTax).add(incomeTax).add(loanEmi).add(otherDeductions);

        // 6. Net Salary calculation
        BigDecimal netSalary = grossSalary.subtract(totalDeductions);
        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            netSalary = BigDecimal.ZERO;
        }

        // 7. Save to database
        Payroll payroll = existingOpt.orElse(new Payroll());
        payroll.setEmployee(employee);
        payroll.setMonth(month);
        payroll.setYear(year);
        payroll.setTotalDays(totalDays);
        payroll.setPresentDays(presentDays);
        payroll.setLeaveDays(leaveDays);
        payroll.setAbsentDays(absentDays);
        payroll.setGrossSalary(grossSalary);
        payroll.setTotalDeductions(totalDeductions);
        payroll.setNetSalary(netSalary);
        payroll.setStatus("DRAFT");
        payroll.setProcessedAt(LocalDateTime.now());

        Payroll savedPayroll = payrollRepository.save(payroll);

        // Save detailed deductions
        Deduction deduction = deductionRepository.findByPayrollId(savedPayroll.getId()).orElse(new Deduction());
        deduction.setPayroll(savedPayroll);
        deduction.setPf(proratedPf);
        deduction.setProfessionalTax(professionalTax);
        deduction.setIncomeTax(incomeTax);
        deduction.setLoanEmi(loanEmi);
        deduction.setOtherDeductions(otherDeductions);
        
        deductionRepository.save(deduction);

        return convertToDTO(savedPayroll);
    }

    @Transactional
    public List<PayrollDTO> runPayrollForAll(Integer month, Integer year) {
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equals(e.getStatus()))
                .collect(Collectors.toList());

        List<PayrollDTO> results = new ArrayList<>();
        for (Employee emp : activeEmployees) {
            try {
                // If a salary structure is not configured, skip to avoid blocking the entire run
                if (salaryStructureRepository.findByEmployeeId(emp.getId()).isPresent()) {
                    results.add(calculatePayroll(emp.getId(), month, year));
                }
            } catch (Exception e) {
                // Log and continue
            }
        }
        return results;
    }

    @Transactional
    public PayrollDTO markAsPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found with ID: " + payrollId));

        if ("PAID".equals(payroll.getStatus())) {
            return convertToDTO(payroll);
        }

        payroll.setStatus("PAID");
        payroll.setProcessedAt(LocalDateTime.now());
        Payroll saved = payrollRepository.save(payroll);

        // Generate and save the PDF Payslip
        try {
            byte[] pdfBytes = payslipService.generatePayslipPdf(saved);
            
            // Unique payslip number: e.g. PS-19524-MAY2026
            String monthName = java.time.Month.of(payroll.getMonth()).name().substring(0,3);
            String payslipNumber = "PS-" + payroll.getEmployee().getEmployeeCode() + "-" + monthName + payroll.getYear() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            Payslip payslip = Payslip.builder()
                    .employee(payroll.getEmployee())
                    .payroll(saved)
                    .payslipNumber(payslipNumber)
                    .pdfData(pdfBytes)
                    .build();

            payslipRepository.save(payslip);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and store PDF payslip: " + e.getMessage(), e);
        }

        return convertToDTO(saved);
    }

    public PayrollDTO convertToDTO(Payroll p) {
        PayrollDTO dto = new PayrollDTO();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployee().getId());
        dto.setEmployeeCode(p.getEmployee().getEmployeeCode());
        dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
        dto.setDepartment(p.getEmployee().getDepartment());
        dto.setDesignation(p.getEmployee().getDesignation());
        dto.setMonth(p.getMonth());
        dto.setYear(p.getYear());
        dto.setTotalDays(p.getTotalDays());
        dto.setPresentDays(p.getPresentDays());
        dto.setLeaveDays(p.getLeaveDays());
        dto.setAbsentDays(p.getAbsentDays());
        dto.setGrossSalary(p.getGrossSalary());
        dto.setTotalDeductions(p.getTotalDeductions());
        dto.setNetSalary(p.getNetSalary());
        dto.setStatus(p.getStatus());
        dto.setProcessedAt(p.getProcessedAt());

        // Fetch structure to get monthly rates
        Optional<SalaryStructure> structOpt = salaryStructureRepository.findByEmployeeId(p.getEmployee().getId());
        if (structOpt.isPresent()) {
            SalaryStructure s = structOpt.get();
            // Store prorated components
            double factor = (p.getPresentDays() + p.getLeaveDays()) / p.getTotalDays();
            BigDecimal multiplier = BigDecimal.valueOf(factor);

            dto.setBasicSalary(s.getBasicSalary().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
            dto.setHra(s.getHra().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
            dto.setDa(s.getDa().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
            dto.setConveyance(s.getConveyance().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
            dto.setMedical(s.getMedical().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
            dto.setOtherAllowances(s.getOtherAllowances().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
        }

        // Fetch detailed deductions
        Optional<Deduction> dedOpt = deductionRepository.findByPayrollId(p.getId());
        if (dedOpt.isPresent()) {
            Deduction d = dedOpt.get();
            dto.setPf(d.getPf());
            dto.setProfessionalTax(d.getProfessionalTax());
            dto.setIncomeTax(d.getIncomeTax());
            dto.setLoanEmi(d.getLoanEmi());
            dto.setOtherDeductions(d.getOtherDeductions());
        }

        return dto;
    }
}
