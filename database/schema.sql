-- MySQL Database Schema for Employee Payroll Management System

CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

-- 1. Users Table (System Credentials & Role Authorization)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- ADMIN, HR, EMPLOYEE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Employees Table (Profile Details)
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Salary Structure Table (Earnings & Deductions configuration per Employee)
CREATE TABLE IF NOT EXISTS salary_structure (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL UNIQUE,
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    da DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    conveyance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    medical DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_allowances DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pf DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    professional_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    income_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    loan_emi DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Attendance Table (Marking check-in/out and overall status per day)
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LEAVE, HALF_DAY
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_date UNIQUE (employee_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Leave Types Table (Categories of Leaves)
CREATE TABLE IF NOT EXISTS leave_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE, -- SL, CL, EL, etc.
    description VARCHAR(255) NULL,
    total_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Leave Balance Table (Remaining leave allotment per employee per leave type)
CREATE TABLE IF NOT EXISTS leave_balance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_balance_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_balance_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_leave_type UNIQUE (employee_id, leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Leave Requests Table (Leave applications & approvals)
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by BIGINT NULL, -- Employee ID of HR/Admin who approved
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_approved_by FOREIGN KEY (approved_by) REFERENCES employees (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Payroll Table (Calculated monthly payroll record summaries)
CREATE TABLE IF NOT EXISTS payroll (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    month INT NOT NULL, -- 1 to 12
    year INT NOT NULL,
    total_days INT NOT NULL, -- Total calendar days in the month
    present_days DOUBLE NOT NULL DEFAULT 0.0,
    leave_days DOUBLE NOT NULL DEFAULT 0.0,
    absent_days DOUBLE NOT NULL DEFAULT 0.0,
    gross_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PAID
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_month_year UNIQUE (employee_id, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Deductions Table (Details of the deductions applied to a payroll run)
CREATE TABLE IF NOT EXISTS deductions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payroll_id BIGINT NOT NULL UNIQUE,
    pf DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    professional_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    income_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    loan_emi DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deductions_payroll FOREIGN KEY (payroll_id) REFERENCES payroll (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Payslips Table (Payslip PDF file storage and tracking details)
CREATE TABLE IF NOT EXISTS payslips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    payroll_id BIGINT NOT NULL UNIQUE,
    payslip_number VARCHAR(50) NOT NULL UNIQUE,
    pdf_data LONGBLOB NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payslips_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_payslips_payroll FOREIGN KEY (payroll_id) REFERENCES payroll (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Notices Table (Notice Board announcements)
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

