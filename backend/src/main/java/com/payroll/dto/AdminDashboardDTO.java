package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDTO {
    private Long employeeCount;
    private BigDecimal monthlyPayrollCost;
    private Long pendingLeaveRequestsCount;
    
    // Charts metadata
    private Map<String, BigDecimal> departmentCostDistribution; // Department -> Cost
    private List<MonthlyTrend> monthlyTrends; // Monthly cost histories

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String monthName; // e.g. "May 2026"
        private BigDecimal cost;
    }
}
