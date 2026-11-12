import os
import io
import datetime
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from config import REPORTS_DIR, CPCB_NAAQS_24HR
from services.pollution_analysis import get_dashboard_summary, compute_row_aqi, categorize_aqi
from services.anomaly_detection import detect_anomalies
from services.recommendation_engine import generate_recommendations
from services.model_training import get_training_status

def create_pdf_report(df, filename=None):
    """
    Builds a university-grade engineering PDF report for EcoVision AI.
    """
    if filename is None:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"EcoVision_AI_Assessment_Report_{timestamp}.pdf"
        
    report_path = os.path.join(REPORTS_DIR, filename)
    doc = SimpleDocTemplate(
        report_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0284C7'),
        spaceAfter=15
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=14,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )

    story = []
    
    # Header & Meta
    story.append(Paragraph("ECOVISION AI: Environmental Intelligence & Abatement Report", title_style))
    story.append(Paragraph("Department of Computer Science & Engineering (AIML) & Environmental Engineering", subtitle_style))
    
    meta_data = [
        [Paragraph("<b>Generated:</b> " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style),
         Paragraph("<b>Report Type:</b> Automated Analytical Assessment", body_style)],
        [Paragraph(f"<b>Dataset Records:</b> {len(df):,}", body_style),
         Paragraph("<b>Standard:</b> CPCB National Ambient Air Quality Standards (NAAQS)", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))
    
    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    exec_summary_text = (
        "EcoVision AI provides an automated, end-to-end framework for ambient air pollution monitoring, "
        "predictive modeling, statistical anomaly isolation, and explainable engineering abatement synthesis. "
        "Urban industrial centers experience severe public health consequences due to fine particulate (PM2.5) exposure. "
        "This platform bridges environmental data science with industrial abatement technologies by converting raw sensor telemetry "
        "into verifiable mitigation actions."
    )
    story.append(Paragraph(exec_summary_text, body_style))
    story.append(Spacer(1, 8))
    
    # 2. Dataset Overview & Data Dictionary
    story.append(Paragraph("2. Environmental Dataset & Data Dictionary", h1_style))
    dict_rows = [
        [Paragraph("Variable", table_header), Paragraph("Type", table_header), Paragraph("Unit", table_header), Paragraph("CPCB 24-hr Benchmark", table_header), Paragraph("Environmental Significance", table_header)],
        [Paragraph("PM2.5", table_cell), Paragraph("Float", table_cell), Paragraph("µg/m³", table_cell), Paragraph("60.0 µg/m³", table_cell), Paragraph("Fine inhalable combustion aerosol", table_cell)],
        [Paragraph("PM10", table_cell), Paragraph("Float", table_cell), Paragraph("µg/m³", table_cell), Paragraph("100.0 µg/m³", table_cell), Paragraph("Fugitive road dust & mechanical aggregates", table_cell)],
        [Paragraph("NO2", table_cell), Paragraph("Float", table_cell), Paragraph("µg/m³", table_cell), Paragraph("80.0 µg/m³", table_cell), Paragraph("Thermal combustion from vehicle & power plant stacks", table_cell)],
        [Paragraph("SO2", table_cell), Paragraph("Float", table_cell), Paragraph("µg/m³", table_cell), Paragraph("80.0 µg/m³", table_cell), Paragraph("Sulphur oxidation from coal & heavy fuel oils", table_cell)],
        [Paragraph("CO", table_cell), Paragraph("Float", table_cell), Paragraph("mg/m³", table_cell), Paragraph("2.0 mg/m³", table_cell), Paragraph("Incomplete hydrocarbon combustion marker", table_cell)],
        [Paragraph("O3", table_cell), Paragraph("Float", table_cell), Paragraph("µg/m³", table_cell), Paragraph("100.0 µg/m³ (8-hr)", table_cell), Paragraph("Secondary photochemical smog oxidant", table_cell)]
    ]
    dict_table = Table(dict_rows, colWidths=[65, 45, 55, 115, 260])
    dict_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(dict_table)
    story.append(Spacer(1, 10))

    # 3. Descriptive Statistics & Summary
    story.append(Paragraph("3. Observed Pollutant Statistics", h1_style))
    summary = get_dashboard_summary(df)
    
    stat_rows = [
        [Paragraph("Pollutant", table_header), Paragraph("Observed Mean", table_header), Paragraph("CPCB Limit", table_header), Paragraph("Compliance Status", table_header)]
    ]
    for p, limit in CPCB_NAAQS_24HR.items():
        val = summary['averages'].get(p)
        if val is not None:
            unit = "mg/m³" if p == 'CO' else "µg/m³"
            status = "Compliant" if val <= limit else f"Exceeded (+{round((val-limit)/limit*100, 1)}%)"
            stat_rows.append([
                Paragraph(p, table_cell),
                Paragraph(f"{val} {unit}", table_cell),
                Paragraph(f"{limit} {unit}", table_cell),
                Paragraph(f"<font color='{'#15803D' if val <= limit else '#B91C1C'}'><b>{status}</b></font>", table_cell)
            ])
            
    stat_table = Table(stat_rows, colWidths=[120, 140, 140, 140])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F766E')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(stat_table)
    story.append(Spacer(1, 10))

    # 4. Embedded Matplotlib Visual Trend Chart
    try:
        fig, ax = plt.subplots(figsize=(7.5, 2.5), dpi=150)
        chart_df = df.copy()
        if 'Date' in chart_df.columns:
            chart_df['Date'] = pd.to_datetime(chart_df['Date'], errors='coerce')
            chart_df = chart_df.sort_values(by='Date')
            
        chart_df_sample = chart_df.tail(60) if len(chart_df) > 60 else chart_df
        
        if 'Date' in chart_df_sample.columns and 'PM2.5' in chart_df_sample.columns:
            ax.plot(chart_df_sample['Date'], chart_df_sample['PM2.5'], label='PM2.5 (µg/m³)', color='#0284C7', linewidth=1.8)
            if 'PM10' in chart_df_sample.columns:
                ax.plot(chart_df_sample['Date'], chart_df_sample['PM10'], label='PM10 (µg/m³)', color='#F59E0B', linewidth=1.2, alpha=0.8)
            ax.axhline(60, color='#EF4444', linestyle='--', linewidth=1.2, label='CPCB PM2.5 24-hr Limit (60)')
            ax.set_title("Recent Ambient Particulate Matter Trajectory (µg/m³)", fontsize=9, fontweight='bold', pad=6)
            ax.set_ylabel("Concentration (µg/m³)", fontsize=8)
            ax.legend(fontsize=7, loc='upper right')
            ax.grid(True, linestyle=':', alpha=0.6)
            fig.autofmt_xdate(rotation=25)
            plt.tight_layout()
            
            img_buf = io.BytesIO()
            plt.savefig(img_buf, format='png')
            img_buf.seek(0)
            plt.close(fig)
            
            story.append(Image(img_buf, width=6.8 * inch, height=2.2 * inch))
            story.append(Spacer(1, 8))
    except Exception as e:
        story.append(Paragraph(f"<i>Visualization generation notice: {str(e)}</i>", callout_style))

    # 5. Machine Learning Evaluation & Comparative Metrics
    story.append(Paragraph("4. Predictive Machine Learning Models (PM2.5 Estimation)", h1_style))
    ml_status = get_training_status()
    
    if ml_status.get('trained'):
        lr_m = ml_status.get('linear_regression', {})
        rf_m = ml_status.get('random_forest', {})
        ml_rows = [
            [Paragraph("Model Architecture", table_header), Paragraph("MAE (µg/m³)", table_header), Paragraph("RMSE (µg/m³)", table_header), Paragraph("R² Coefficient", table_header), Paragraph("Generalization Summary", table_header)],
            [Paragraph("Linear Regression (Baseline OLS)", table_cell), Paragraph(str(lr_m.get('mae', 'N/A')), table_cell), Paragraph(str(lr_m.get('rmse', 'N/A')), table_cell), Paragraph(str(lr_m.get('r2', 'N/A')), table_cell), Paragraph("Linear baseline; limited capturing non-linear interactions", table_cell)],
            [Paragraph("Random Forest Regressor (Ensemble)", table_cell), Paragraph(str(rf_m.get('mae', 'N/A')), table_cell), Paragraph(str(rf_m.get('rmse', 'N/A')), table_cell), Paragraph(str(rf_m.get('r2', 'N/A')), table_cell), Paragraph("Superior capture of multi-pollutant non-linear dependencies", table_cell)]
        ]
        ml_table = Table(ml_rows, colWidths=[140, 75, 75, 75, 175])
        ml_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(ml_table)
    else:
        story.append(Paragraph("Machine learning models are scheduled for background retrain on full telemetry.", callout_style))
    story.append(Spacer(1, 10))

    # 6. Anomaly Detection & Statistical Outlier Isolation
    story.append(Paragraph("5. Anomaly Detection Analysis (Scikit-learn Isolation Forest)", h1_style))
    anomaly_res = detect_anomalies(df, contamination=0.03)
    story.append(Paragraph(
        f"Evaluated {anomaly_res['total_analyzed']:,} telemetry records. Isolated <b>{anomaly_res['anomaly_count']}</b> "
        f"multivariate statistical outliers ({anomaly_res['anomaly_percentage']}% of dataset).",
        body_style
    ))
    
    top_anomalies = anomaly_res.get('anomalies', [])[:4]
    if top_anomalies:
        anom_rows = [
            [Paragraph("Date", table_header), Paragraph("Location / Station", table_header), Paragraph("PM2.5", table_header), Paragraph("PM10", table_header), Paragraph("NO2", table_header), Paragraph("Isolation Score", table_header), Paragraph("Primary Sensor Spikes", table_header)]
        ]
        for a in top_anomalies:
            anom_rows.append([
                Paragraph(str(a.get('date', '-')), table_cell),
                Paragraph(str(a.get('city', '-')), table_cell),
                Paragraph(str(a.get('pm25', '-')), table_cell),
                Paragraph(str(a.get('pm10', '-')), table_cell),
                Paragraph(str(a.get('no2', '-')), table_cell),
                Paragraph(str(a.get('anomaly_score', '-')), table_cell),
                Paragraph(str(a.get('detected_spikes', '-')), table_cell)
            ])
        anom_table = Table(anom_rows, colWidths=[65, 80, 45, 45, 45, 65, 195])
        anom_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#991B1B')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FEF2F2')]),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(anom_table)
    story.append(Spacer(1, 10))

    # 7. Abatement Recommendations
    story.append(Paragraph("6. AI Abatement Action Recommendations", h1_style))
    recs = generate_recommendations(df)
    for idx, r in enumerate(recs[:3], 1):
        story.append(Paragraph(f"<b>Recommendation {idx}: {r['proposed_measure']}</b>", h2_style))
        story.append(Paragraph(f"<b>Triggering Pollutant:</b> {r['pollutant']} | <b>Observed:</b> {r['observed_value']} {r['unit']} (Standard: {r['reference_threshold']} {r['unit']}) | <b>Risk:</b> {r['risk_level']}", body_style))
        story.append(Paragraph(f"<b>Scientific Rationale:</b> {r['scientific_explanation']}", body_style))
        story.append(Paragraph(f"<b>Expected Environmental Gain:</b> {r['expected_benefit']}", body_style))
        story.append(Spacer(1, 4))
        
    # 8. Limitations & Methodology Conclusion
    story.append(Spacer(1, 6))
    story.append(Paragraph("7. Methodological Limitations & Conclusion", h1_style))
    limitations_text = (
        "<b>Limitations & Scientific Scope:</b> Telemetry imputation utilizes localized medians and temporal interpolation. "
        "Estimated PM2.5 concentrations are statistical models based on ground-level precursor observations and do not model "
        "synoptic meteorological dispersion, solar radiation flux, or thermal inversion layer height. "
        "<b>Conclusion:</b> Continuous real-time telemetry processing coupled with explainable machine learning "
        "provides municipal and industrial environmental managers with verifiable insights for preemptive pollution abatement."
    )
    story.append(Paragraph(limitations_text, body_style))
    story.append(Spacer(1, 6))

    # 9. Academic & Regulatory References
    story.append(Paragraph("8. Regulatory & Academic References", h1_style))
    refs_text = (
        "1. Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Govt. of India, "
        "<i>National Air Quality Index (NAQI) Standard Report</i>, 2014.<br/>"
        "2. World Health Organization (WHO), <i>WHO Global Air Quality Guidelines: Particulate matter (PM2.5 and PM10), "
        "ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide</i>, Geneva, 2021.<br/>"
        "3. Breiman, L., 'Random Forests', <i>Machine Learning</i>, 45(1), 5-32, 2001.<br/>"
        "4. Liu, F. T., Ting, K. M., & Zhou, Z. H., 'Isolation Forest', <i>IEEE ICDM</i>, 413-422, 2008."
    )
    story.append(Paragraph(refs_text, body_style))
    
    # Build document
    doc.build(story)
    return report_path, filename
