import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Database,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { generateReport, getReportDownloadUrl, getCSVDownloadUrl } from '../services/api';

export default function ReportGeneratorPage({ setNotification }) {
  const [generating, setGenerating] = useState(false);
  const [latestReport, setLatestReport] = useState(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await generateReport();
      setLatestReport(res);
      if (setNotification) {
        setNotification({
          type: 'success',
          message: 'Comprehensive PDF Environmental Assessment Report successfully generated.'
        });
      }
    } catch (err) {
      if (setNotification) {
        setNotification({
          type: 'error',
          message: err.response?.data?.error || 'Failed to generate PDF report.'
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Generate Action */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Automated Analytical Report & Export Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generates university-grade environmental engineering PDF assessment reports with embedded vector charts, tables, and downloadable CSV callsets.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all shrink-0"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Compiling ReportLab PDF...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Assessment Report (PDF)
            </>
          )}
        </button>
      </div>

      {/* Generated Report Alert & Download Card */}
      {latestReport && (
        <div className="p-5 rounded-2xl glass-card-accent border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold block">
                PDF GENERATION SUCCESSFUL
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {latestReport.filename}
              </span>
            </div>
          </div>

          <a
            href={getReportDownloadUrl(latestReport.filename)}
            download={latestReport.filename}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        </div>
      )}

      {/* Report Structure & Included Modules Overview */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-white tracking-wide">
          Included Report Sections & Technical Scope
        </h3>
        <p className="text-xs text-slate-400">
          The generated document fulfills comprehensive CSE AIML and Environmental Engineering assessment requirements:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" /> 1. Data Dictionary
            </span>
            <p className="text-[11px] text-slate-400">
              Full breakdown of monitored parameters (PM2.5, PM10, NO2, SO2, CO, O3) and CPCB NAAQS standards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400" /> 2. Descriptive Stats & Trends
            </span>
            <p className="text-[11px] text-slate-400">
              Observed means, maximum peaks, compliance status, and embedded high-resolution Matplotlib trend plots.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" /> 3. ML Models & Metrics
            </span>
            <p className="text-[11px] text-slate-400">
              Random Forest and Linear Regression holdout evaluation table with MAE, RMSE, and R² variance scores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> 4. Anomalies & Abatement
            </span>
            <p className="text-[11px] text-slate-400">
              Isolation Forest outlier table and explainable engineering abatement measures with chemical mechanisms.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & CSV Downloads Hub */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-white tracking-wide">
          Raw & Cleaned Data Export Hub
        </h3>
        <p className="text-xs text-slate-400">
          Download standardized CSV callsets for independent auditing, reproduction, and external analysis:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Cleaned CSV */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold block">DATASET EXPORT</span>
              <h4 className="text-sm font-bold text-white mt-1">Cleaned Telemetry CSV</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Standardized columns, imputed missing values, deduplicated observations.
              </p>
            </div>
            <a
              href={getCSVDownloadUrl('cleaned')}
              download="ecovision_cleaned_dataset.csv"
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Cleaned CSV
            </a>
          </div>

          {/* Anomaly CSV */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold block">ANOMALY EXPORT</span>
              <h4 className="text-sm font-bold text-white mt-1">Detected Anomalies CSV</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Records flagged by Isolation Forest with computed anomaly scores and spike attributes.
              </p>
            </div>
            <a
              href={getCSVDownloadUrl('anomalies')}
              download="ecovision_detected_anomalies.csv"
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Anomalies CSV
            </a>
          </div>

          {/* Predictions CSV */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-mono text-teal-400 font-semibold block">PREDICTION EXPORT</span>
              <h4 className="text-sm font-bold text-white mt-1">Model Predictions CSV</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Actual vs predicted PM2.5 concentrations, sub-indices, and categorized risk outcomes.
              </p>
            </div>
            <a
              href={getCSVDownloadUrl('predictions')}
              download="ecovision_predictions_export.csv"
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Predictions CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
