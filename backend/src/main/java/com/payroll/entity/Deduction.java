package com.payroll.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deductions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payroll_id", nullable = false, unique = true)
    private Payroll payroll;

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

    @Builder.Default
    @Column(name = "other_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
