"""
PDF Generation logic for mortgage quotes.
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import TYPE_CHECKING

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)

if TYPE_CHECKING:
    from .loan_types import LoanTypeQuoteSummary


def generate_quote_pdf(summary: LoanTypeQuoteSummary) -> bytes:
    """
    Generate a professional branded PDF for a mortgage quote.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#6C5CE7"), # Purple from branding
        spaceAfter=12,
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.grey,
        spaceAfter=24,
    )

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.black,
        spaceBefore=12,
        spaceAfter=6,
    )

    elements = []

    # 1. Header / Branding
    elements.append(Paragraph("Project Nyra Mortgage Quote", title_style))
    elements.append(Paragraph(f"Quote ID: {summary.quote_id} | Generated: {datetime.now().strftime('%Y-%m-%d')}", subtitle_style))
    elements.append(Spacer(1, 0.2 * inch))

    # 2. Main Loan Details
    elements.append(Paragraph("Loan Summary", header_style))
    
    # Format currency helper
    def fmt_curr(val: float) -> str:
        return f"${val:,.2f}"

    summary_data = [
        ["Loan Type", summary.loan_type.upper()],
        ["Property Value", fmt_curr(summary.property_value)],
        ["Loan Amount", fmt_curr(summary.base_loan_amount)],
        ["LTV Ratio", f"{summary.ltv * 100:.2f}%"],
        ["Interest Rate", f"{summary.annual_interest_rate * 100:.3f}%"],
        ["Term", f"{summary.term_years} Years"],
    ]

    t = Table(summary_data, colWidths=[2 * inch, 3 * inch])
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.3 * inch))

    # 3. Payment Breakdown (PITI)
    elements.append(Paragraph("Monthly Payment Breakdown (PITI)", header_style))
    
    payment_data = [
        ["Principal & Interest", fmt_curr(summary.periodic_payment_pi)],
        ["Property Tax (Est)", "Included"],
        ["Home Insurance (Est)", "Included"],
        ["PMI / MIP", fmt_curr(summary.monthly_pmi_or_mip)],
        ["Total Monthly Payment", fmt_curr(summary.periodic_payment_piti)],
    ]

    tp = Table(payment_data, colWidths=[2 * inch, 3 * inch])
    tp.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#F3F0FF")),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
    ]))
    elements.append(tp)
    elements.append(Spacer(1, 0.4 * inch))

    # 4. Closing Costs / Upfront
    elements.append(Paragraph("Closing Cost Estimates", header_style))
    
    closing_data = [
        ["Upfront Fees", fmt_curr(summary.upfront_fees)],
        ["Financed Amount", fmt_curr(summary.financed_amount)],
        ["Down Payment", fmt_curr(summary.down_payment)],
    ]

    tc = Table(closing_data, colWidths=[2 * inch, 3 * inch])
    tc.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
    ]))
    elements.append(tc)
    
    # 5. Disclaimers (Compliance)
    elements.append(Spacer(1, 0.5 * inch))
    disclaimer_text = (
        "<b>DISCLAIMER:</b> This is an informational quote only and does not constitute a commitment to lend. "
        "Actual interest rates and loan terms are subject to credit approval, appraisal, and market conditions. "
        "Figures provided are estimates based on the information provided. Ellis D Andersen / West Capital Lending (NMLS# 2145025)."
    )
    elements.append(Paragraph(disclaimer_text, styles['Italic']))

    # Build PDF
    doc.build(elements)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
