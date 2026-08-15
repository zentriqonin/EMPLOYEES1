package com.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructureDTO {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private BigDecimal basicSalary = BigDecimal.ZERO;
    private BigDecimal hra = BigDecimal.ZERO;
    private BigDecimal da = BigDecimal.ZERO;
    private BigDecimal conveyance = BigDecimal.ZERO;
    private BigDecimal medical = BigDecimal.ZERO;
    private BigDecimal otherAllowances = BigDecimal.ZERO;
    private BigDecimal pf = BigDecimal.ZERO;
    private BigDecimal professionalTax = BigDecimal.ZERO;
    private BigDecimal incomeTax = BigDecimal.ZERO;
    private BigDecimal loanEmi = BigDecimal.ZERO;
}
