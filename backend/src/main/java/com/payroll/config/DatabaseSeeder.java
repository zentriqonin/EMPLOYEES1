package com.payroll.config;

import com.payroll.entity.*;
import com.payroll.repository.*;
import com.payroll.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NoticeRepository noticeRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Leave Types
        if (leaveTypeRepository.count() == 0) {
            leaveTypeRepository.save(LeaveType.builder().name("Sick Leave").code("SL").description("Sick and medical leave").totalDays(12).build());
            leaveTypeRepository.save(LeaveType.builder().name("Casual Leave").code("CL").description("Casual leave for urgent work").totalDays(12).build());
            leaveTypeRepository.save(LeaveType.builder().name("Earned Leave").code("EL").description("Earned personal leaves").totalDays(18).build());
        }

        // 2. Seed Users & Linked Employees
        if (userRepository.count() == 0) {
            // Seed Admin User
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            adminUser = userRepository.save(adminUser);

            Employee adminEmp = Employee.builder()
                    .user(adminUser)
                    .employeeCode("EMP001")
                    .firstName("Admirra")
                    .lastName("John")
                    .email("admin@payroll.com")
                    .phone("9876543210")
                    .department("Management")
                    .designation("System Administrator")
                    .joiningDate(LocalDate.of(2025, 1, 1))
                    .status("ACTIVE")
                    .build();
            adminEmp = employeeRepository.save(adminEmp);
            seedSalaryAndBalances(adminEmp);

            // Seed HR User
            User hrUser = User.builder()
                    .username("hr")
                    .password(passwordEncoder.encode("hr123"))
                    .role(Role.HR)
                    .build();
            hrUser = userRepository.save(hrUser);

            Employee hrEmp = Employee.builder()
                    .user(hrUser)
                    .employeeCode("EMP002")
                    .firstName("Ali")
                    .lastName("Mujeed")
                    .email("hr@payroll.com")
                    .phone("9876543211")
                    .department("Human Resources")
                    .designation("HR Executive")
                    .joiningDate(LocalDate.of(2025, 6, 15))
                    .status("ACTIVE")
                    .build();
            hrEmp = employeeRepository.save(hrEmp);
            seedSalaryAndBalances(hrEmp);

            // Seed Employee User
            User employeeUser = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("employee123"))
                    .role(Role.EMPLOYEE)
                    .build();
            employeeUser = userRepository.save(employeeUser);

            Employee regularEmp = Employee.builder()
                    .user(employeeUser)
                    .employeeCode("EMP003")
                    .firstName("Arunkumar")
                    .lastName("P")
                    .email("arun@payroll.com")
                    .phone("9876543212")
                    .department("Technology")
                    .designation("Relationship Manager - I")
                    .joiningDate(LocalDate.of(2026, 4, 27))
                    .status("ACTIVE")
                    .build();
            regularEmp = employeeRepository.save(regularEmp);
            seedSalaryAndBalances(regularEmp);

            // Seed more sample employees for the dashboard table
            Employee emp4 = Employee.builder()
                    .employeeCode("EMP004")
                    .firstName("Mark")
                    .lastName("Leo")
                    .email("mark@payroll.com")
                    .phone("9876543213")
                    .department("UI/UX Design")
                    .designation("Contract Designer")
                    .joiningDate(LocalDate.of(2025, 10, 1))
                    .status("ACTIVE")
                    .build();
            employeeRepository.save(emp4);
            seedSalaryAndBalances(emp4);

            Employee emp5 = Employee.builder()
                    .employeeCode("EMP005")
                    .firstName("Justin")
                    .lastName("Agnes")
                    .email("justin@payroll.com")
                    .phone("9876543214")
                    .department("Finance")
                    .designation("Financial Analyst")
                    .joiningDate(LocalDate.of(2026, 2, 10))
                    .status("ACTIVE")
                    .build();
            employeeRepository.save(emp5);
            seedSalaryAndBalances(emp5);

            // Seed Attendance for May/June/July 2026
            seedAttendanceData(adminEmp);
            seedAttendanceData(hrEmp);
            seedAttendanceData(regularEmp);
            seedAttendanceData(emp4);
            seedAttendanceData(emp5);

            // Seed Notices
            if (noticeRepository.count() == 0) {
                noticeRepository.save(Notice.builder()
                        .title("Welcome to the New HR Payroll Hub!")
                        .content("We are excited to launch our new Employee Payroll Portal. You can now track your attendance, request leaves, and download payslips directly from your dashboard. Please verify your profile details and contact HR if you find any discrepancies.")
                        .createdBy(adminUser)
                        .isActive(true)
                        .build());

                noticeRepository.save(Notice.builder()
                        .title("Upcoming Scheduled Maintenance")
                        .content("Please note that the Payroll Hub will be undergoing scheduled maintenance this Sunday from 2:00 AM to 6:00 AM UTC. The system will be temporarily unavailable during this period. Thank you for your cooperation.")
                        .createdBy(adminUser)
                        .isActive(true)
                        .build());

                noticeRepository.save(Notice.builder()
                        .title("Policy Update: Casual Leaves Request Timeline")
                        .content("Effective next month, casual leaves must be requested at least 48 hours in advance, except in case of emergencies. Please plan your leaves accordingly and coordinate with your team lead.")
                        .createdBy(hrUser)
                        .isActive(true)
                        .build());
            }
        }
    }

    private void seedSalaryAndBalances(Employee employee) {
        // Salary Structure
        SalaryStructure salary = SalaryStructure.builder()
                .employee(employee)
                .basicSalary(BigDecimal.valueOf(9000.00))
                .hra(BigDecimal.valueOf(2000.00))
                .da(BigDecimal.valueOf(2250.00))
                .conveyance(BigDecimal.valueOf(630.00))
                .medical(BigDecimal.valueOf(1250.00))
                .otherAllowances(BigDecimal.valueOf(5837.00))
                .pf(BigDecimal.valueOf(1125.00))
                .professionalTax(BigDecimal.valueOf(300.00))
                .incomeTax(BigDecimal.valueOf(1200.00))
                .loanEmi(BigDecimal.valueOf(0.00))
                .build();
        salaryStructureRepository.save(salary);

        // Leave Balances
        for (LeaveType type : leaveTypeRepository.findAll()) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .balance(type.getTotalDays())
                    .used(0)
                    .build();
            leaveBalanceRepository.save(balance);
        }
    }

    private void seedAttendanceData(Employee employee) {
        LocalDate start = LocalDate.of(2026, 7, 1);
        LocalDate end = LocalDate.now();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            // Skip weekends for direct PRESENT marking (or mark them present by default)
            if (date.getDayOfWeek().getValue() == 6 || date.getDayOfWeek().getValue() == 7) {
                continue;
            }
            
            Attendance attendance = Attendance.builder()
                    .employee(employee)
                    .date(date)
                    .status("PRESENT")
                    .checkInTime(LocalTime.of(9, 0))
                    .checkOutTime(LocalTime.of(18, 0))
                    .build();
            
            // Randomly seed an absent day
            if (date.getDayOfMonth() == 12) {
                attendance.setStatus("ABSENT");
                attendance.setCheckInTime(null);
                attendance.setCheckOutTime(null);
            }
            // Randomly seed a leave day
            if (date.getDayOfMonth() == 20) {
                attendance.setStatus("LEAVE");
                attendance.setCheckInTime(null);
                attendance.setCheckOutTime(null);
            }
            
            attendanceRepository.save(attendance);
        }
    }
}
