package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDashboardDTO {
    private List<LeaveBalanceInfo> leaveBalances;
    private BigDecimal latestPayslipNetPay;
    private String latestPayslipMonthYear;
    private Double presentDaysCurrentMonth;
    private Double leaveDaysCurrentMonth;
    private Double absentDaysCurrentMonth;
    private Long pendingLeavesCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveBalanceInfo {
        private String leaveTypeName;
        private String leaveTypeCode;
        private Integer balance;
        private Integer used;
    }
}
