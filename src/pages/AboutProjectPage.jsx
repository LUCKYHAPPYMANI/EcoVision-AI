import React from 'react';
import {
  BookOpen,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Globe,
  Database,
  Code2,
  Scale
} from 'lucide-react';

export default function AboutProjectPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title & Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold tracking-wider">
          <BookOpen className="w-4 h-4" /> ACADEMIC ASSESSMENT DOCUMENTATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ECOVISION AI: AI-Powered Air Pollution Monitoring, Prediction & Abatement System
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          An end-to-end intelligent environmental telemetry platform designed for Computer Science & Engineering (AIML) and Environmental Engineering capstone assessment. Bridges machine learning predictive inference with explainable industrial abatement engineering.
        </p>
      </div>

      {/* 1. Problem Statement & Objectives */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" /> 1. Problem Statement & Objectives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 text-sm block">The Environmental Crisis:</span>
            <p>
              Fine particulate matter (PM2.5) with aerodynamic diameters under 2.5 micrometers penetrates deep into human bronchial pathways and alveoli, inducing chronic obstructive pulmonary diseases (COPD) and cardiovascular mortalities. Urban industrial zones frequently experience acute atmospheric inversions and localized emission surges that existing monitoring networks only observe reactively.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-300 text-sm block">EcoVision AI Objectives:</span>
            <p>
              1. Ingest, normalize, and impute authentic multi-station CAAQMS telemetry without discarding valid observations.<br/>
              2. Predict PM2.5 concentrations from gaseous co-pollutants and temporal indicators using ensemble machine learning.<br/>
              3. Isolate multivariate anomalies using Isolation Forest.<br/>
              4. Generate explainable, science-backed industrial abatement strategies based on CPCB NAAQS standards.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Existing System vs Proposed System Comparison */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-400" /> 2. Existing Systems vs. EcoVision AI
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Evaluation Dimension</th>
                <th className="py-3 px-3 text-slate-400">Legacy / Existing Systems</th>
                <th className="py-3 px-3 text-cyan-300 font-bold">EcoVision AI Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Monitoring Paradigms</td>
                <td className="py-3 px-3 text-slate-400">Static tabular dashboards; retrospective historical logs</td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">Real-time dynamic visualization with automated multi-pollutant cross-correlation</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Data Cleansing</td>
                <td className="py-3 px-3 text-slate-400">Manual spreadsheet curation or silent row deletion</td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">Resilient header aliasing, negative value sanitization, and grouped median imputation</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Predictive Modeling</td>
                <td className="py-3 px-3 text-slate-400">Absent or basic unvalidated univariate linear extrapolation</td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">Comparative dual-model suite (Random Forest vs OLS) with leak-free chronological validation</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Outlier Surveillance</td>
                <td className="py-3 px-3 text-slate-400">Arbitrary fixed thresholds ignoring multi-sensor synergy</td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">Scikit-learn Isolation Forest isolating non-linear multivariate anomalies</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Mitigation Synthesis</td>
                <td className="py-3 px-3 text-slate-400">Generic public advisories without engineering mechanisms</td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">Explainable rule engine providing industrial abatement measures with scientific rationale</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. System Architecture */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" /> 3. System Architecture & Telemetry Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-mono text-cyan-400 font-bold block">1. INGESTION LAYER</span>
            <p className="text-slate-300">
              Multi-station CSV parser with flexible header aliasing, file integrity validation, and raw missing/duplicate audit.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-mono text-teal-400 font-bold block">2. PREPROCESSING</span>
            <p className="text-slate-300">
              Sensor error sanitization, date formatting, and spatial grouped median imputation to preserve continuous time-series records.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-mono text-purple-400 font-bold block">3. MACHINE LEARNING</span>
            <p className="text-slate-300">
              Random Forest Regressor (100 estimators) and OLS Linear Regression for PM2.5 concentration estimation; Isolation Forest for outliers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-mono text-amber-400 font-bold block">4. ADVISORY & REPORTING</span>
            <p className="text-slate-300">
              CPCB NAAQS rule engine synthesizing industrial abatement actions, coupled with ReportLab PDF compilation.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Algorithms Explained */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" /> 4. Machine Learning Algorithms & Mathematical Foundations
        </h2>
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Random Forest Regressor</h3>
            <p>
              An ensemble method that builds multiple de-correlated decision trees using bootstrap aggregation (bagging) and random feature subspace selection. It minimizes variance without overfitting:
            </p>
            <div className="font-mono bg-slate-950 p-2.5 rounded-lg text-cyan-300">
              y_pred = (1 / B) * Σ [b=1 to B] T_b(x)
            </div>
            <p>
              Gini impurity reduction across tree nodes quantifies feature importance, exposing how co-pollutants (PM10, NO2, SO2) impact fine particulate suspension.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Ordinary Least Squares (OLS) Linear Regression</h3>
            <p>
              Serves as an interpretable baseline model minimizing the sum of squared residuals:
            </p>
            <div className="font-mono bg-slate-950 p-2.5 rounded-lg text-cyan-300">
              min_β || y - Xβ ||²₂  =&gt;  β = (X^T X)⁻¹ X^T y
            </div>
            <p>
              Features are scaled using StandardScaler fitted exclusively on the 80% chronological training partition to prevent look-ahead data leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Isolation Forest (Unsupervised Anomaly Isolation)</h3>
            <p>
              Unlike distance-based outlier algorithms that suffer from the curse of dimensionality, Isolation Forest recursively partitions feature space using random splits. Anomalous observations reside in sparse regions and are isolated closer to tree roots:
            </p>
            <div className="font-mono bg-slate-950 p-2.5 rounded-lg text-cyan-300">
              s(x, n) = 2^(- E(h(x)) / c(n))
            </div>
            <p>
              Where E(h(x)) is the average path length and c(n) is the average path length of unsuccessful searches in a Binary Search Tree.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Dataset Provenance & Authenticity */}
      <div className="glass-panel p-6 rounded-2xl space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" /> 5. Dataset Provenance & Integrity Policy
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          In strict compliance with academic standards, EcoVision AI maintains unambiguous provenance tracking:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 font-mono block">AUTHENTIC CPCB TELEMETRY</span>
            <p className="text-slate-400">
              Sourced from official Central Pollution Control Board (CPCB) Continuous Ambient Air Quality Monitoring Stations across Indian metropolitan cities (Chennai, Delhi, Bengaluru, Hyderabad).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 font-mono block">DEMO SYNTHETIC TEST SUITE</span>
            <p className="text-slate-400">
              Clearly labeled synthetic test records containing deliberate anomalies, negative readings, and missing values specifically used to verify automated data cleaning and outlier alerts.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Ethical Considerations & References */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" /> 6. Ethical Considerations & Regulatory References
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <b>Environmental Justice & Sensor Drift:</b> Air quality models must account for low-cost sensor calibration drift, humidity interference, and geographic station density disparities. Model predictions should never be used as the sole legal basis for industrial closure or punitive actions without ground-truth physical sensor verification.
          </p>
          <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400 font-mono text-[11px]">
            <span className="font-bold text-slate-200 block mb-1">Key References:</span>
            <p>1. Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Govt. of India, <i>National Air Quality Index (NAQI) Standard Report</i>, 2014.</p>
            <p>2. World Health Organization (WHO), <i>WHO Global Air Quality Guidelines: Particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide</i>, Geneva, 2021.</p>
            <p>3. Breiman, L., 'Random Forests', <i>Machine Learning</i>, 45(1), 5-32, 2001.</p>
            <p>4. Liu, F. T., Ting, K. M., & Zhou, Z. H., 'Isolation Forest', <i>IEEE International Conference on Data Mining</i>, 413-422, 2008.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
