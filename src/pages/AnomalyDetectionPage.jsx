import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Sliders,
  Filter,
  Download,
  Search,
  RefreshCw,
  Info,
  ShieldAlert,
  Radio,
  Building2,
  Calendar
} from 'lucide-react';
import { detectAnomalies, getCSVDownloadUrl } from '../services/api';

export default function AnomalyDetectionPage({ setNotification }) {
  const [contamination, setContamination] = useState(0.05);
  const [loading, setLoading] = useState(true);
  const [anomalyData, setAnomalyData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await detectAnomalies({ contamination });
      setAnomalyData(res);
    } catch (err) {
      console.error(err);
      if (setNotification) {
        setNotification({
          type: 'error',
          message: err.response?.data?.error || 'Failed to execute anomaly detection.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [contamination]);

  // Filter anomalies by search term (city, station, or spike)
  const filteredAnomalies = (anomalyData?.anomalies || []).filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.city?.toLowerCase().includes(term) ||
      a.station?.toLowerCase().includes(term) ||
      a.detected_spikes?.toLowerCase().includes(term) ||
      a.date?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Contamination Slider */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Isolation Forest Statistical Anomaly Detection
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unsupervised multi-pollutant tree isolation algorithm identifying localized spikes, sensor calibration drift, and unusual emissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getCSVDownloadUrl('anomalies')}
              download="ecovision_detected_anomalies.csv"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export Anomalies CSV
            </a>
          </div>
        </div>

        {/* Contamination Parameter Controls */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4" /> CONFIGURABLE CONTAMINATION PARAMETER (OUTLIER PROPORTION)
            </span>
            <p className="text-[11px] text-slate-400">
              Specifies the expected upper-bound percentage of abnormal telemetry observations in the dataset.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={contamination}
              onChange={(e) => setContamination(parseFloat(e.target.value))}
              className="w-44 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-sm font-bold text-cyan-300 w-12 text-right">
              {(contamination * 100).toFixed(0)}%
            </span>
            <button
              onClick={fetchAnomalies}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Rerun Isolation Forest"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Anomaly Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL ANALYZED OBSERVATIONS</span>
          <div className="text-2xl font-bold text-white font-mono">
            {anomalyData?.total_analyzed?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-500">Multivariate sensor records</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-rose-500/30 bg-rose-950/10">
          <span className="text-xs font-mono text-rose-400 block mb-1">ISOLATED OUTLIERS</span>
          <div className="text-2xl font-bold text-rose-300 font-mono">
            {anomalyData?.anomaly_count?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-400">Exceeding partition threshold</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block mb-1">ANOMALY PERCENTAGE</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {anomalyData?.anomaly_percentage || 0}%
          </div>
          <span className="text-[11px] text-slate-500">Effective contamination rate</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anomalies by city, station or pollutant spike..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredAnomalies.length} of {anomalyData?.anomaly_count || 0} detected anomalies
        </span>
      </div>

      {/* Anomaly Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4 text-right">PM2.5</th>
                <th className="py-3 px-4 text-right">PM10</th>
                <th className="py-3 px-4 text-right">NO2</th>
                <th className="py-3 px-4 text-right">SO2</th>
                <th className="py-3 px-4 text-right">Isolation Score</th>
                <th className="py-3 px-4">Identified Spikes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filteredAnomalies.length > 0 ? (
                filteredAnomalies.map((anom) => (
                  <tr key={anom.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{anom.date}</td>
                    <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">{anom.city}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[150px]">{anom.station}</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-300">
                      {anom.pm25 !== null ? `${anom.pm25}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-orange-300">
                      {anom.pm10 !== null ? `${anom.pm10}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-300">
                      {anom.no2 !== null ? `${anom.no2}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {anom.so2 !== null ? `${anom.so2}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {anom.anomaly_score}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {anom.detected_spikes}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No anomalies matching current search filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Advisory Callout */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 block mb-0.5">Statistical Outlier Advisory:</span>
          {anomalyData?.explanation ||
            "Anomalies represent statistical outliers isolated in high-dimensional feature space. They warrant operational investigation regarding sensor calibration or localized emission incidents, but do not automatically constitute legal regulatory non-compliance."}
        </div>
      </div>
    </div>
  );
}
