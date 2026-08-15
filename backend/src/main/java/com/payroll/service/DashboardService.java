package com.payroll.service;

import com.payroll.dto.*;
import com.payroll.entity.*;
import com.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDTO getAdminDashboardData() {
        // 1. Employee Count
        long employeeCount = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equals(e.getStatus()))
                .count();

        // 2. Pending leaves count
        long pendingLeaves = leaveRequestRepository.findByStatus("PENDING").size();

        // Get current month/year
        LocalDate today = LocalDate.now();
        int currentMonthVal = today.getMonthValue();
        int currentYear = today.getYear();

        // 3. Current month payroll cost
        List<Payroll> currentMonthPayrolls = payrollRepository.findByMonthAndYear(currentMonthVal, currentYear);
        BigDecimal currentMonthCost = currentMonthPayrolls.stream()
                .map(Payroll::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Department cost distribution
        Map<String, BigDecimal> departmentCost = new HashMap<>();
        for (Payroll p : currentMonthPayrolls) {
            String dept = p.getEmployee().getDepartment();
            departmentCost.put(dept, departmentCost.getOrDefault(dept, BigDecimal.ZERO).add(p.getNetSalary()));
        }

        // 5. Monthly trend for the last 6 months
        List<AdminDashboardDTO.MonthlyTrend> trends = new ArrayList<>();
        LocalDate checkDate = today.minusMonths(5);
        for (int i = 0; i < 6; i++) {
            int m = checkDate.getMonthValue();
            int y = checkDate.getYear();
            
            List<Payroll> monthPayrolls = payrollRepository.findByMonthAndYear(m, y);
            BigDecimal cost = monthPayrolls.stream()
                    .map(Payroll::getNetSalary)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String monthLabel = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + y;
            trends.add(new AdminDashboardDTO.MonthlyTrend(monthLabel, cost));
            
            checkDate = checkDate.plusMonths(1);
        }

        return AdminDashboardDTO.builder()
                .employeeCount(employeeCount)
                .monthlyPayrollCost(currentMonthCost)
                .pendingLeaveRequestsCount(pendingLeaves)
                .departmentCostDistribution(departmentCost)
                .monthlyTrends(trends)
                .build();
    }

    @Transactional(readOnly = true)
    public EmployeeDashboardDTO getEmployeeDashboardData(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        // 1. Leave Balances
        List<EmployeeDashboardDTO.LeaveBalanceInfo> balances = leaveBalanceRepository.findByEmployeeId(employeeId).stream()
                .map(b -> new EmployeeDashboardDTO.LeaveBalanceInfo(
                        b.getLeaveType().getName(),
                        b.getLeaveType().getCode(),
                        b.getBalance(),
                        b.getUsed()
                ))
                .collect(Collectors.toList());

        // 2. Latest Payslip Net Pay
        BigDecimal latestNetPay = BigDecimal.ZERO;
        String latestMonthYear = "N/A";
        List<Payroll> payrolls = payrollRepository.findByEmployeeId(employeeId).stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .sorted(Comparator.comparing(Payroll::getYear).thenComparing(Payroll::getMonth).reversed())
                .collect(Collectors.toList());

        if (!payrolls.isEmpty()) {
            Payroll p = payrolls.get(0);
            latestNetPay = p.getNetSalary();
            latestMonthYear = Month.of(p.getMonth()).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + p.getYear();
        }

        // 3. Attendance summaries for the current month
        LocalDate today = LocalDate.now();
        LocalDate start = today.withDayOfMonth(1);
        LocalDate end = today.withDayOfMonth(today.lengthOfMonth());
        
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);
        double present = 0.0;
        double leave = 0.0;
        double absent = 0.0;

        for (Attendance att : attendances) {
            String status = att.getStatus().toUpperCase();
            if ("LEAVE".equals(status)) {
                leave += 1.0;
            } else if ("ABSENT".equals(status)) {
                absent += 1.0;
            } else if ("HALF_DAY".equals(status)) {
                absent += 0.5;
                present += 0.5;
            } else {
                present += 1.0;
            }
        }

        // Default unmarked days in the month as present (weekends/holidays)
        int elapsedDays = today.getDayOfMonth();
        double recordedDays = present + leave + absent;
        if (recordedDays < elapsedDays) {
            present += (elapsedDays - recordedDays);
        }

        // 4. Pending leaves count
        long pendingCount = leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .count();

        return EmployeeDashboardDTO.builder()
                .leaveBalances(balances)
                .latestPayslipNetPay(latestNetPay)
                .latestPayslipMonthYear(latestMonthYear)
                .presentDaysCurrentMonth(present)
                .leaveDaysCurrentMonth(leave)
                .absentDaysCurrentMonth(absent)
                .pendingLeavesCount(pendingCount)
                .build();
    }
}
