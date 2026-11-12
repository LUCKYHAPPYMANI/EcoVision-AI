import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Radio,
  Wind,
  Flame,
  Droplets,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { getSummary, getTrends } from '../services/api';

const RISK_COLORS = {
  Good: '#10B981',
  Satisfactory: '#34D399',
  Moderate: '#FBBF24',
  Poor: '#F97316',
  'Very Poor': '#EF4444',
  Severe: '#7F1D1D'
};

export default function DashboardPage({ setActivePage }) {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes] = await Promise.all([
        getSummary(),
        getTrends({ pollutant: 'PM2.5' })
      ]);
      setSummary(sumRes);
      setTrends(trendRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Computing real-time environmental metrics & trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border-red-500/30 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Failed to Load Dashboard Telemetry</h3>
        <p className="text-sm text-slate-300 mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Format risk distribution data for Pie Chart
  const pieData = Object.entries(summary?.risk_distribution || {})
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // Pollutant comparison list
  const pollutantAvgData = Object.entries(summary?.averages || {})
    .filter(([_, val]) => val !== null)
    .map(([pollutant, value]) => ({ pollutant, value }));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card-accent gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Active Telemetry: {summary?.active_dataset?.name}
            </h2>
            <p className="text-xs text-slate-400">
              {summary?.active_dataset?.type === 'SYNTHETIC_DEMO_DATA_FOR_TESTING'
                ? '🧪 Demonstration Synthetic Dataset with deliberate test edge cases'
                : '🌿 Authentic Central Pollution Control Board (CPCB) Ambient Monitoring Records'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('explorer')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            Upload / Change CSV
          </button>
          <button
            onClick={fetchData}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Records */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">TOTAL RECORDS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {summary?.total_records?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Observed data points</div>
        </div>

        {/* Cities */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">CITIES</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-300 tracking-tight">
            {summary?.cities_count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Monitored urban centers</div>
        </div>

        {/* Stations */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">STATIONS</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">
            {summary?.stations_count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">CAAQMS telemetry points</div>
        </div>

        {/* Avg PM2.5 */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">AVG PM2.5</span>
            <Wind className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {summary?.averages?.['PM2.5'] ?? 'N/A'}{' '}
            <span className="text-xs text-slate-400 font-normal">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standard: 60.0 µg/m³</div>
        </div>

        {/* Avg PM10 */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">AVG PM10</span>
            <Droplets className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-300 tracking-tight">
            {summary?.averages?.['PM10'] ?? 'N/A'}{' '}
            <span className="text-xs text-slate-400 font-normal">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standard: 100.0 µg/m³</div>
        </div>

        {/* Avg NO2 */}
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">AVG NO2</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">
            {summary?.averages?.['NO2'] ?? 'N/A'}{' '}
            <span className="text-xs text-slate-400 font-normal">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standard: 80.0 µg/m³</div>
        </div>
      </div>

      {/* Highest Measurement & Peak Callout */}
      {summary?.highest_measurement && summary.highest_measurement.value > 0 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
                PEAK TELEMETRY SPIKE DETECTED
              </span>
              <p className="text-sm text-slate-200">
                Peak measurement of{' '}
                <span className="font-bold text-amber-300">
                  {summary.highest_measurement.value} µg/m³
                </span>{' '}
                ({summary.highest_measurement.pollutant}) recorded in{' '}
                <span className="font-medium text-white">{summary.highest_measurement.city}</span>{' '}
                on {summary.highest_measurement.date}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('anomalies')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors"
          >
            Inspect Anomalies <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Visualizations: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Time Series Area Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Air Quality Concentration Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Temporal trends for PM2.5 & PM10 with CPCB 24-hr threshold lines
              </p>
            </div>
            <button
              onClick={() => setActivePage('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            {trends?.time_series?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="PM2.5"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pm25Gradient)"
                    name="PM2.5 (µg/m³)"
                  />
                  {trends.time_series.some((d) => d.PM10 !== undefined) && (
                    <Area
                      type="monotone"
                      dataKey="PM10"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#pm10Gradient)"
                      name="PM10 (µg/m³)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No time-series observations available
              </div>
            )}
          </div>
        </div>

        {/* Right: AQI Risk Distribution Donut */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                AQI Risk Distribution
              </h3>
              <p className="text-xs text-slate-400">CPCB Category Classification</p>
            </div>
            <button
              onClick={() => setActivePage('risk')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No risk data
              </div>
            )}
          </div>

          {/* Risk Legend Pills */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(summary?.risk_distribution || {}).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[cat] || '#94a3b8' }}
                  ></span>
                  <span className="text-slate-300 font-medium">{cat}</span>
                </div>
                <span className="font-mono text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: City Comparison & Pollutant Correlation Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City-wise Comparison Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              City-wise PM2.5 Comparison
            </h3>
            <p className="text-xs text-slate-400">Mean fine particulate matter concentration</p>
          </div>

          <div className="h-64 w-full">
            {trends?.city_comparison?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.city_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="city"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="PM2.5" fill="#06b6d4" radius={[6, 6, 0, 0]} name="PM2.5 (µg/m³)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Single city dataset loaded
              </div>
            )}
          </div>
        </div>

        {/* Pollutant Correlation Heatmap Matrix */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              Pollutant Correlation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Pearson correlation coefficients between monitored pollutants
            </p>
          </div>

          {trends?.correlation?.pollutants?.length > 1 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-mono text-slate-400"></th>
                    {trends.correlation.pollutants.map((p) => (
                      <th key={p} className="p-2 text-xs font-mono text-cyan-300 font-semibold">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trends.correlation.pollutants.map((rowP, rIdx) => (
                    <tr key={rowP}>
                      <td className="p-2 text-xs font-mono text-cyan-300 font-semibold text-left">
                        {rowP}
                      </td>
                      {trends.correlation.matrix[rIdx]?.map((val, cIdx) => {
                        const numVal = parseFloat(val);
                        const isPos = numVal > 0;
                        const intensity = Math.min(Math.abs(numVal), 1);
                        const bgColor = isPos
                          ? `rgba(6, 182, 212, ${intensity * 0.5 + 0.1})`
                          : `rgba(239, 68, 68, ${intensity * 0.5 + 0.1})`;
                        return (
                          <td
                            key={cIdx}
                            className="p-2 text-xs font-mono rounded m-0.5 border border-slate-800/40"
                            style={{ backgroundColor: bgColor }}
                          >
                            <span className={intensity > 0.5 ? 'font-bold text-white' : 'text-slate-200'}>
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              Insufficient multi-pollutant variables for correlation matrix
            </div>
          )}
        </div>
      </div>

      {/* Quick Launchpad to System Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActivePage('prediction')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border-cyan-500/20 hover:border-cyan-500/50 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> AI Prediction Engine
            </h4>
            <p className="text-xs text-slate-400">
              Evaluate Random Forest vs Linear Regression for PM2.5 inference.
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-cyan-400 shrink-0" />
        </div>

        <div
          onClick={() => setActivePage('abatement')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border-teal-500/20 hover:border-teal-500/50 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" /> Abatement Advisor
            </h4>
            <p className="text-xs text-slate-400">
              Scientific recommendations grounded in CPCB NAAQS standards.
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-teal-400 shrink-0" />
        </div>

        <div
          onClick={() => setActivePage('report')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border-emerald-500/20 hover:border-emerald-500/50 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> PDF Assessment Report
            </h4>
            <p className="text-xs text-slate-400">
              Generate & download full ReportLab environmental assessment document.
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
