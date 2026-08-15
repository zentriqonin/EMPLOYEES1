package com.payroll.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.payroll.entity.*;
import com.payroll.repository.DeductionRepository;
import com.payroll.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
public class PayslipService {

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private DeductionRepository deductionRepository;

    // Theme Colors
    private static final Color BRAND_NAVY = new Color(20, 33, 61);
    private static final Color BRAND_NAVY_LIGHT = new Color(31, 46, 82);
    private static final Color BRAND_GOLD = new Color(201, 161, 90);
    private static final Color BRAND_IVORY = new Color(251, 248, 242);
    private static final Color BRAND_MUTED = new Color(138, 134, 118);
    private static final Color BRAND_GOLD_TINT = new Color(242, 237, 225);
    private static final Color BRAND_WARM_GRAY = new Color(229, 224, 213);

    @Transactional(readOnly = true)
    public byte[] generatePayslipPdf(Payroll payroll) throws Exception {
        Employee employee = payroll.getEmployee();
        
        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(employee.getId())
                .orElse(new SalaryStructure());
        
        Deduction deduction = deductionRepository.findByPayrollId(payroll.getId())
                .orElse(new Deduction());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);
        document.open();

        // 1. Header Box
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBackgroundColor(BRAND_NAVY);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPaddingTop(12);
        titleCell.setPaddingBottom(12);
        titleCell.setPaddingLeft(16);
        
        Paragraph titleParagraph = new Paragraph();
        titleParagraph.add(new Chunk("Zentriqon Tech Solutions", FontFactory.getFont(FontFactory.TIMES_BOLD, 18, Font.BOLD, Color.WHITE)));
        titleParagraph.add(new Chunk("   PAYROLL HUB", FontFactory.getFont(FontFactory.TIMES_BOLD, 10, Font.BOLD, BRAND_GOLD)));
        titleCell.addElement(titleParagraph);
        headerTable.addCell(titleCell);

        String monthName = Month.of(payroll.getMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        PdfPCell subtitleCell = new PdfPCell(new Paragraph("Payslip — " + monthName + " " + payroll.getYear(), 
                FontFactory.getFont(FontFactory.TIMES_ROMAN, 12, Font.NORMAL, Color.WHITE)));
        subtitleCell.setBackgroundColor(BRAND_NAVY_LIGHT);
        subtitleCell.setBorder(Rectangle.NO_BORDER);
        subtitleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        subtitleCell.setPadding(8);
        headerTable.addCell(subtitleCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));

        // 2. Employee Info Panel (3 Columns)
        PdfPTable infoGrid = new PdfPTable(3);
        infoGrid.setWidthPercentage(100);
        infoGrid.setSpacingBefore(10f);
        infoGrid.setSpacingAfter(24f);

        PdfPCell infoCell = new PdfPCell();
        infoCell.setColspan(3);
        infoCell.setBackgroundColor(BRAND_IVORY);
        infoCell.setBorderColor(BRAND_WARM_GRAY);
        infoCell.setBorderWidth(0.5f);
        infoCell.setPadding(12);

        // Nested table for 3 clusters
        PdfPTable clusterTable = new PdfPTable(3);
        clusterTable.setWidthPercentage(100);
        clusterTable.setWidths(new float[]{1f, 1f, 1f});

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BRAND_MUTED);
        Font valFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_NAVY);

        // Cluster 1: Employee
        PdfPTable empTable = new PdfPTable(2);
        empTable.setWidthPercentage(100);
        empTable.setWidths(new float[]{1f, 1.5f});
        addKeyVal(empTable, "Name", employee.getFirstName() + " " + employee.getLastName(), labelFont, valFont);
        addKeyVal(empTable, "Code", employee.getEmployeeCode(), labelFont, valFont);
        addKeyVal(empTable, "Designation", employee.getDesignation(), labelFont, valFont);
        addKeyVal(empTable, "Department", employee.getDepartment(), labelFont, valFont);
        
        PdfPCell c1 = new PdfPCell(empTable);
        c1.setBorder(Rectangle.NO_BORDER);
        clusterTable.addCell(c1);

        // Cluster 2: Employment
        PdfPTable empInfoTable = new PdfPTable(2);
        empInfoTable.setWidthPercentage(100);
        empInfoTable.setWidths(new float[]{1f, 1.5f});
        addKeyVal(empInfoTable, "Joining Date", employee.getJoiningDate() != null ? employee.getJoiningDate().toString() : "N/A", labelFont, valFont);
        addKeyVal(empInfoTable, "Bank A/c", "XXXXXX" + (employee.getPhone() != null && employee.getPhone().length() > 4 ? employee.getPhone().substring(employee.getPhone().length() - 4) : "1234"), labelFont, valFont);
        
        PdfPCell c2 = new PdfPCell(empInfoTable);
        c2.setBorder(Rectangle.LEFT);
        c2.setBorderColor(BRAND_WARM_GRAY);
        c2.setBorderWidthLeft(0.5f);
        c2.setPaddingLeft(10f);
        clusterTable.addCell(c2);

        // Cluster 3: Attendance
        PdfPTable attTable = new PdfPTable(2);
        attTable.setWidthPercentage(100);
        attTable.setWidths(new float[]{1.2f, 1f});
        addKeyVal(attTable, "Working Days", String.valueOf(payroll.getTotalDays()), labelFont, valFont);
        addKeyVal(attTable, "Present Days", String.valueOf(payroll.getPresentDays()), labelFont, valFont);
        addKeyVal(attTable, "Leave Days", String.valueOf(payroll.getLeaveDays()), labelFont, valFont);
        addKeyVal(attTable, "LOP/Absent", String.valueOf(payroll.getAbsentDays()), labelFont, valFont);
        
        PdfPCell c3 = new PdfPCell(attTable);
        c3.setBorder(Rectangle.LEFT);
        c3.setBorderColor(BRAND_WARM_GRAY);
        c3.setBorderWidthLeft(0.5f);
        c3.setPaddingLeft(10f);
        clusterTable.addCell(c3);

        infoCell.addElement(clusterTable);
        infoGrid.addCell(infoCell);
        document.add(infoGrid);

        // 3. Earnings and Deductions (Side by side)
        PdfPTable payTable = new PdfPTable(3);
        payTable.setWidthPercentage(100);
        payTable.setWidths(new float[]{4.8f, 0.4f, 4.8f}); // Middle col for spacing
        payTable.setSpacingAfter(24f);

        double factor = (payroll.getPresentDays() + payroll.getLeaveDays()) / payroll.getTotalDays();
        BigDecimal prMultiplier = BigDecimal.valueOf(factor);

        // Earnings
        PdfPTable earnTable = new PdfPTable(2);
        earnTable.setWidthPercentage(100);
        earnTable.setWidths(new float[]{3f, 1.5f});
        addSectionHeader(earnTable, "Earnings");
        
        BigDecimal basicEarned = structure.getBasicSalary().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hraEarned = structure.getHra().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal daEarned = structure.getDa().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal convEarned = structure.getConveyance().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medEarned = structure.getMedical().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);
        BigDecimal otherEarned = structure.getOtherAllowances().multiply(prMultiplier).setScale(2, RoundingMode.HALF_UP);

        addLineItem(earnTable, "Basic Salary", basicEarned.toString(), false);
        addLineItem(earnTable, "House Rent Allowance", hraEarned.toString(), false);
        addLineItem(earnTable, "Dearness Allowance", daEarned.toString(), false);
        addLineItem(earnTable, "Conveyance Allowance", convEarned.toString(), false);
        addLineItem(earnTable, "Medical Allowance", medEarned.toString(), false);
        addLineItem(earnTable, "Other Allowances", otherEarned.toString(), false);
        addLineItem(earnTable, "Gross earnings", payroll.getGrossSalary().toString(), true);
        
        PdfPCell earnCell = new PdfPCell(earnTable);
        earnCell.setBorder(Rectangle.NO_BORDER);
        payTable.addCell(earnCell);

        // Spacer
        PdfPCell spaceCell = new PdfPCell();
        spaceCell.setBorder(Rectangle.NO_BORDER);
        payTable.addCell(spaceCell);

        // Deductions
        PdfPTable dedTable = new PdfPTable(2);
        dedTable.setWidthPercentage(100);
        dedTable.setWidths(new float[]{3f, 1.5f});
        addSectionHeader(dedTable, "Deductions");

        addLineItem(dedTable, "Provident Fund (PF)", deduction.getPf().toString(), false);
        addLineItem(dedTable, "Professional Tax", deduction.getProfessionalTax().toString(), false);
        addLineItem(dedTable, "Income Tax", deduction.getIncomeTax().toString(), false);
        addLineItem(dedTable, "Loan EMI", deduction.getLoanEmi().toString(), false);
        addLineItem(dedTable, "Other Deductions", deduction.getOtherDeductions().toString(), false);
        addLineItem(dedTable, "", "", false); // Alignment row
        addLineItem(dedTable, "Gross deductions", payroll.getTotalDeductions().toString(), true);

        PdfPCell dedCell = new PdfPCell(dedTable);
        dedCell.setBorder(Rectangle.NO_BORDER);
        payTable.addCell(dedCell);

        document.add(payTable);

        // 4. Net Salary Block
        PdfPTable netTable = new PdfPTable(1);
        netTable.setWidthPercentage(100);
        
        PdfPCell netWrapper = new PdfPCell();
        netWrapper.setBackgroundColor(BRAND_IVORY);
        netWrapper.setBorderColor(BRAND_WARM_GRAY);
        netWrapper.setBorderWidth(0.5f);
        netWrapper.setBorderWidthLeft(4f);
        netWrapper.setBorderColorLeft(BRAND_GOLD);
        netWrapper.setPadding(16);

        Paragraph netLabel = new Paragraph("Net salary payable", FontFactory.getFont(FontFactory.HELVETICA, 11, BRAND_MUTED));
        Paragraph netVal = new Paragraph("Rs. " + payroll.getNetSalary().toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BRAND_NAVY));
        
        String netSalaryInWords = convertNumberToWords(payroll.getNetSalary().intValue());
        Paragraph wordsVal = new Paragraph("Rupees " + netSalaryInWords + " Only", FontFactory.getFont(FontFactory.TIMES_ITALIC, 10, BRAND_MUTED));
        
        netWrapper.addElement(netLabel);
        netWrapper.addElement(netVal);
        netWrapper.addElement(wordsVal);
        
        netTable.addCell(netWrapper);
        document.add(netTable);
        
        // 5. Footer
        document.add(new Paragraph("\n\n\n"));
        
        // Divider
        PdfPTable footerDivider = new PdfPTable(1);
        footerDivider.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(Rectangle.TOP);
        lineCell.setBorderColor(BRAND_GOLD);
        lineCell.setBorderWidthTop(0.5f);
        footerDivider.addCell(lineCell);
        document.add(footerDivider);

        document.add(new Paragraph("\n"));
        Paragraph footerText = new Paragraph("This is a computer-generated document and does not require a physical signature.", 
                FontFactory.getFont(FontFactory.HELVETICA, 9, BRAND_MUTED));
        footerText.setAlignment(Element.ALIGN_CENTER);
        document.add(footerText);

        document.close();
        return baos.toByteArray();
    }

    private void addKeyVal(PdfPTable table, String key, String val, Font keyFont, Font valFont) {
        PdfPCell kCell = new PdfPCell(new Paragraph(key, keyFont));
        kCell.setBorder(Rectangle.NO_BORDER);
        kCell.setPadding(3);
        table.addCell(kCell);

        PdfPCell vCell = new PdfPCell(new Paragraph(val, valFont));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPadding(3);
        table.addCell(vCell);
    }

    private void addSectionHeader(PdfPTable table, String title) {
        PdfPCell titleCell = new PdfPCell(new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        titleCell.setColspan(2);
        titleCell.setBackgroundColor(BRAND_NAVY);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPadding(8);
        table.addCell(titleCell);
    }

    private void addLineItem(PdfPTable table, String label, String amount, boolean isSubtotal) {
        Font font = FontFactory.getFont(isSubtotal ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA, 9, BRAND_NAVY);
        Color bg = isSubtotal ? BRAND_GOLD_TINT : BRAND_IVORY;

        PdfPCell lblCell = new PdfPCell(new Paragraph(label, font));
        lblCell.setBackgroundColor(bg);
        lblCell.setBorderColor(BRAND_WARM_GRAY);
        lblCell.setBorderWidth(0.5f);
        lblCell.setPadding(6);
        table.addCell(lblCell);

        PdfPCell valCell = new PdfPCell(new Paragraph(amount, font));
        valCell.setBackgroundColor(bg);
        valCell.setBorderColor(BRAND_WARM_GRAY);
        valCell.setBorderWidth(0.5f);
        valCell.setPadding(6);
        valCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valCell);
    }

    private static final String[] units = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
    private static final String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

    public static String convertNumberToWords(int number) {
        if (number == 0) {
            return "Zero";
        }
        if (number < 0) {
            return "Minus " + convertNumberToWords(Math.abs(number));
        }
        String words = "";
        if ((number / 10000000) > 0) {
            words += convertNumberToWords(number / 10000000) + " Crore ";
            number %= 10000000;
        }
        if ((number / 100000) > 0) {
            words += convertNumberToWords(number / 100000) + " Lakh ";
            number %= 100000;
        }
        if ((number / 1000) > 0) {
            words += convertNumberToWords(number / 1000) + " Thousand ";
            number %= 1000;
        }
        if ((number / 100) > 0) {
            words += convertNumberToWords(number / 100) + " Hundred ";
            number %= 100;
        }
        if (number > 0) {
            if (number < 20) {
                words += units[number];
            } else {
                words += tens[number / 10];
                if ((number % 10) > 0) {
                    words += " " + units[number % 10];
                }
            }
        }
        return words.trim();
    }
}
