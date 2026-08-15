package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayslipDTO {
    private Long id;
    private Long employeeId;
    private String payslipNumber;
    private LocalDateTime generatedAt;
    private PayrollSummaryDTO payroll;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PayrollSummaryDTO {
        private Long id;
        private Integer month;
        private Integer year;
    }
}
