from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, grey
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
import json

def generate_pdf_report(audit_data: dict) -> BytesIO:
    """
    Generate a comprehensive PDF report from audit data
    """
    # Create PDF buffer
    pdf_buffer = BytesIO()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
    )
    
    # Container for PDF elements
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Title
    elements.append(Paragraph("FairScan AI Bias Audit Report", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Report metadata
    metadata = [
        ["Report Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ["Dataset:", audit_data.get("dataset_name", "Unknown")],
        ["Target Variable:", audit_data.get("target_variable", "Unknown")],
    ]
    
    metadata_table = Table(metadata, colWidths=[2*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#f0f9ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#e0e7ff')),
    ]))
    elements.append(metadata_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    
    metrics = audit_data.get("metrics", {})
    overall_score = metrics.get("overall_bias_score", {})
    
    summary_text = f"""
    This report presents a comprehensive fairness audit of your AI model. The analysis reveals 
    an overall bias score of <b>{overall_score.get('score', 'N/A')}%</b> with a bias level of 
    <b>{overall_score.get('level', 'Unknown')}</b>. 
    
    The audit examined {metrics.get('dataset_info', {}).get('total_samples', 0)} samples 
    across {len(audit_data.get('sensitive_attributes', []))} sensitive attributes to identify 
    potential fairness issues and recommend mitigation strategies.
    """
    
    elements.append(Paragraph(summary_text, styles['BodyText']))
    elements.append(Spacer(1, 0.2*inch))
    
    # Key Findings
    elements.append(Paragraph("Key Findings", heading_style))
    
    fairness_metrics = metrics.get("fairness_metrics", {})
    findings = []
    
    for attr, attr_metrics in fairness_metrics.items():
        if isinstance(attr_metrics, dict):
            di_ratio = attr_metrics.get("disparate_impact_ratio", 1.0)
            dpd = attr_metrics.get("demographic_parity_difference", 0)
            
            findings.append(f"<b>{attr}:</b> Disparate Impact Ratio = {di_ratio:.4f}, Demographic Parity Difference = {dpd:.4f}")
    
    if findings:
        for finding in findings[:5]:  # Limit to 5 findings
            elements.append(Paragraph(f"• {finding}", styles['BodyText']))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Detailed Metrics by Group
    elements.append(Paragraph("Detailed Analysis by Sensitive Attribute", heading_style))
    
    group_metrics = metrics.get("group_metrics", {})
    for attr, groups in list(group_metrics.items())[:3]:  # Limit to 3 attributes
        elements.append(Paragraph(f"<b>{attr}</b>", styles['Heading3']))
        
        group_data = [["Group", "Count", "Approval Rate", "% of Dataset"]]
        for group_name, group_info in groups.items():
            group_data.append([
                str(group_name),
                str(group_info.get("count", 0)),
                f"{group_info.get('approval_rate', 0):.2%}",
                f"{group_info.get('percentage_of_dataset', 0):.2%}"
            ])
        
        if len(group_data) > 1:
            table = Table(group_data, colWidths=[1.5*inch, 1*inch, 1.5*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('white')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#e0e7ff')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('white'), HexColor('#f0f9ff')]),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 0.15*inch))
    
    # Recommendations
    elements.append(PageBreak())
    elements.append(Paragraph("Recommendations", heading_style))
    
    recommendations = [
        "Implement data resampling and balancing techniques to ensure fair representation of all groups",
        "Consider threshold optimization for different sensitive attribute groups",
        "Develop feature engineering strategies to reduce proxy discrimination",
        "Establish continuous fairness monitoring and regular audits",
        "Document all fairness considerations in model development and deployment",
        "Engage stakeholders in fairness assessment and mitigation strategy selection"
    ]
    
    for i, rec in enumerate(recommendations, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {rec}", styles['BodyText']))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Footer
    footer_text = "This report was generated by FairScan AI Bias Auditor. Please consult with fairness experts for implementation guidance."
    elements.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=HexColor('#666666'),
        alignment=TA_CENTER
    )))
    
    # Build PDF
    doc.build(elements)
    
    # Reset buffer position
    pdf_buffer.seek(0)
    
    return pdf_buffer
