package com.payroll.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll", uniqueConstraints = {
    @UniqueConstraint(name = "uq_employee_month_year", columnNames = {"employee_id", "month", "year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Builder.Default
    @Column(name = "present_days", nullable = false)
    private Double presentDays = 0.0;

    @Builder.Default
    @Column(name = "leave_days", nullable = false)
    private Double leaveDays = 0.0;

    @Builder.Default
    @Column(name = "absent_days", nullable = false)
    private Double absentDays = 0.0;

    @Builder.Default
    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, PAID

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
