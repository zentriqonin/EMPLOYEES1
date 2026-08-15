package com.payroll.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_structure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Builder.Default
    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal hra = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal da = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal conveyance = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal medical = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "other_allowances", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pf = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "professional_tax", nullable = false, precision = 12, scale = 2)
    private BigDecimal professionalTax = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "income_tax", nullable = false, precision = 12, scale = 2)
    private BigDecimal incomeTax = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "loan_emi", nullable = false, precision = 12, scale = 2)
    private BigDecimal loanEmi = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
