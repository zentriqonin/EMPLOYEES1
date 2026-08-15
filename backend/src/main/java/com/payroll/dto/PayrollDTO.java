package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollDTO {
    private Long id;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String department;
    private String designation;

    private Integer month;
    private Integer year;
    private Integer totalDays;
    private Double presentDays;
    private Double leaveDays;
    private Double absentDays;

    // Prorated Earnings
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal da;
    private BigDecimal conveyance;
    private BigDecimal medical;
    private BigDecimal otherAllowances;
    private BigDecimal grossSalary;

    // Deductions
    private BigDecimal pf;
    private BigDecimal professionalTax;
    private BigDecimal incomeTax;
    private BigDecimal loanEmi;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;

    private BigDecimal netSalary;
    private String status; // DRAFT, PAID
    private LocalDateTime processedAt;
}
