import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Info,
  ShieldCheck
} from 'lucide-react';
import { uploadCSV, cleanDataset, getAvailableDatasets, loadDataset, getCSVDownloadUrl } from '../services/api';

export default function DataExplorerPage({ setNotification }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [cleanMetrics, setCleanMetrics] = useState(null);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await getAvailableDatasets();
      setAvailableDatasets(res.datasets || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setNotification({
        type: 'error',
        message: 'Invalid file type. Please upload a CSV (.csv) file.'
      });
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'File size exceeds maximum allowable limit of 50 MB.'
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    try {
      const res = await uploadCSV(selectedFile);
      setAnalysis(res.analysis);
      setCleanMetrics(null);
      setNotification({
        type: 'success',
        message: `Dataset '${selectedFile.name}' successfully parsed and validated.`
      });
      fetchDatasets();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to upload CSV.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLoadBuiltIn = async (filename) => {
    setLoadingDataset(true);
    try {
      const res = await loadDataset(filename);
      setCleanMetrics(res.clean_metrics);
      setNotification({
        type: 'success',
        message: `Loaded dataset: ${filename}`
      });
      fetchDatasets();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load dataset.'
      });
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleCleanData = async () => {
    setCleaning(true);
    try {
      const res = await cleanDataset();
      setCleanMetrics(res.metrics);
      setNotification({
        type: 'success',
        message: 'Data cleaning pipeline completed. Imputed missing values and deduplicated observations.'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to clean dataset.'
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Built-in Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-2xl glass-panel gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> Environmental Data Explorer & Preprocessing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload custom air quality CSV telemetry, inspect missing or negative sensor values, and execute the automated cleaning pipeline.
          </p>
        </div>

        {/* Built-in selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Sample Telemetry:</span>
          {availableDatasets.map((d) => (
            <button
              key={d.filename}
              onClick={() => handleLoadBuiltIn(d.filename)}
              disabled={loadingDataset}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                d.is_active
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              {d.is_synthetic ? '🧪 Demo Synthetic' : '🌿 ' + d.display_name.slice(0, 18)}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-700/60 hover:border-cyan-500/40 bg-slate-900/20'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-teal-400/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/10">
            {uploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Drag & Drop Your Air Quality CSV Here
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard CSV format with columns for PM2.5, PM10, NO2, SO2, CO, O3, Date, City, Station.
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-500/20 transition-all">
              <FileSpreadsheet className="w-4 h-4" />
              Browse CSV File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block">
            Maximum file size: 50 MB
          </span>
        </div>
      </div>

      {/* Raw Dataset Inspection & Validation Audit */}
      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-xs font-mono text-slate-400">TOTAL RECORDS</span>
              <div className="text-2xl font-bold text-white mt-1">
                {analysis.total_records.toLocaleString()}
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-xs font-mono text-slate-400">DUPLICATE ROWS</span>
              <div className={`text-2xl font-bold mt-1 ${analysis.duplicate_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {analysis.duplicate_count}
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-xs font-mono text-slate-400">INVALID NEGATIVES</span>
              <div className={`text-2xl font-bold mt-1 ${Object.keys(analysis.negative_stats || {}).length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Object.values(analysis.negative_stats || {}).reduce((a, b) => a + b, 0)}
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-xs font-mono text-slate-400">POLLUTANTS DETECTED</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {analysis.available_pollutants?.length || 0}
              </div>
            </div>
          </div>

          {/* Column Mapping Section */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Resilient Column Aliasing & Detection
            </h3>
            <p className="text-xs text-slate-400">
              The platform automatically recognizes variations such as <code>pm2_5</code>, <code>pm25</code>, <code>no_2</code>, and maps them to standardized parameters without requiring manual code changes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(analysis.mapped_columns || {}).map(([raw, std]) => (
                <div
                  key={raw}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs"
                >
                  <span className="font-mono text-slate-400">{raw}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="font-mono font-semibold text-cyan-300">{std}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Value Audit Table */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Missing Value Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2 px-3">Column</th>
                    <th className="py-2 px-3">Missing Count</th>
                    <th className="py-2 px-3">Missing %</th>
                    <th className="py-2 px-3">Data Quality Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {Object.entries(analysis.missing_stats || {}).map(([col, stat]) => (
                    <tr key={col}>
                      <td className="py-2 px-3 font-semibold text-slate-200">{col}</td>
                      <td className="py-2 px-3 text-slate-300">{stat.count}</td>
                      <td className="py-2 px-3 text-slate-300">{stat.percentage}%</td>
                      <td className="py-2 px-3">
                        {stat.count === 0 ? (
                          <span className="text-emerald-400 font-medium">100% Complete</span>
                        ) : stat.percentage < 15 ? (
                          <span className="text-amber-400 font-medium">Minor Gaps ({stat.percentage}%)</span>
                        ) : (
                          <span className="text-rose-400 font-medium">Elevated Gaps ({stat.percentage}%)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trigger Cleaning Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCleanData}
              disabled={cleaning}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
            >
              {cleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Cleaning Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Clean & Preprocess Dataset
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cleaning Results Audit Log & Download */}
      {cleanMetrics && (
        <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 space-y-4 bg-emerald-950/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Dataset Successfully Cleaned & Imputed
                </h3>
                <p className="text-xs text-slate-300">
                  All rows normalized. Missing values imputed using temporal grouping and medians without discarding telemetry records.
                </p>
              </div>
            </div>

            <a
              href={getCSVDownloadUrl('cleaned')}
              download="ecovision_cleaned_dataset.csv"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" /> Download Cleaned CSV
            </a>
          </div>

          {/* Cleaning summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block">INITIAL RECORDS</span>
              <span className="text-lg font-bold text-white font-mono">
                {cleanMetrics.initial_record_count}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block">FINAL RECORDS</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {cleanMetrics.final_record_count}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block">DUPLICATES REMOVED</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {cleanMetrics.duplicates_removed}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block">MISSING VALUES IMPUTED</span>
              <span className="text-lg font-bold text-teal-400 font-mono">
                {cleanMetrics.missing_values_imputed}
              </span>
            </div>
          </div>

          {/* Operations Audit Trail */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-mono text-slate-400 block">OPERATIONS AUDIT LOG:</span>
            <ul className="space-y-1 text-xs text-slate-300">
              {cleanMetrics.operations_log?.map((log, i) => (
                <li key={i} className="flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{log}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
