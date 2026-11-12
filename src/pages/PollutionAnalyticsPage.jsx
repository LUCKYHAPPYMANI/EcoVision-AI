import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  AlertTriangle,
  RefreshCw,
  Building2,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { getTrends } from '../services/api';

const POLLUTANTS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'];

const POLLUTANT_COLORS = {
  'PM2.5': '#06b6d4',
  PM10: '#f59e0b',
  NO2: '#f43f5e',
  SO2: '#8b5cf6',
  CO: '#10b981',
  O3: '#ec4899'
};

export default function PollutionAnalyticsPage() {
  const [pollutant, setPollutant] = useState('PM2.5');
  const [city, setCity] = useState('all');
  const [station, setStation] = useState('all');
  const [chartType, setChartType] = useState('area');
  const [multiPollutant, setMultiPollutant] = useState(false);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getTrends({
        pollutant,
        city: city !== 'all' ? city : undefined,
        station: station !== 'all' ? station : undefined,
      });
      setTrends(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [pollutant, city, station]);

  return (
    <div className="space-y-6">
      {/* Top Filter Control Bar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Interactive Pollution Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic multi-parameter filtering, temporal trend analysis, and pollutant distribution modeling.
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === 'line'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bar
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Pollutant Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">PRIMARY POLLUTANT</label>
            <select
              value={pollutant}
              onChange={(e) => setPollutant(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {POLLUTANTS.map((p) => (
                <option key={p} value={p}>
                  {p} ({p === 'CO' ? 'mg/m³' : 'µg/m³'})
                </option>
              ))}
            </select>
          </div>

          {/* City Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">CITY FILTER</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setStation('all');
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Available Cities</option>
              {trends?.cities?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Station Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">STATION FILTER</label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Monitoring Stations</option>
              {trends?.stations?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-pollutant Compare Toggle */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setMultiPollutant(!multiPollutant)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                multiPollutant
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {multiPollutant ? 'Multi-Pollutant Active' : 'Overlay All Pollutants'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dynamic Chart */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              {multiPollutant ? 'Multi-Pollutant Trajectory' : `${pollutant} Concentration Series`}
            </h3>
            <p className="text-xs text-slate-400">
              Filtered by: {city === 'all' ? 'All Cities' : city} | {station === 'all' ? 'All Stations' : station}
            </p>
          </div>
          {loading && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
        </div>

        <div className="h-80 w-full">
          {trends?.time_series?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={trends.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={POLLUTANT_COLORS[pollutant]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={POLLUTANT_COLORS[pollutant]} stopOpacity={0.0} />
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
                  {multiPollutant ? (
                    POLLUTANTS.map((p) =>
                      trends.time_series.some((d) => d[p] !== undefined) ? (
                        <Area
                          key={p}
                          type="monotone"
                          dataKey={p}
                          stroke={POLLUTANT_COLORS[p]}
                          fillOpacity={0.2}
                          fill={POLLUTANT_COLORS[p]}
                          name={`${p} (${p === 'CO' ? 'mg/m³' : 'µg/m³'})`}
                        />
                      ) : null
                    )
                  ) : (
                    <Area
                      type="monotone"
                      dataKey={pollutant}
                      stroke={POLLUTANT_COLORS[pollutant]}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#primaryArea)"
                      name={`${pollutant} (${pollutant === 'CO' ? 'mg/m³' : 'µg/m³'})`}
                    />
                  )}
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={trends.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {multiPollutant ? (
                    POLLUTANTS.map((p) =>
                      trends.time_series.some((d) => d[p] !== undefined) ? (
                        <Line
                          key={p}
                          type="monotone"
                          dataKey={p}
                          stroke={POLLUTANT_COLORS[p]}
                          strokeWidth={2}
                          dot={false}
                          name={`${p} (${p === 'CO' ? 'mg/m³' : 'µg/m³'})`}
                        />
                      ) : null
                    )
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={pollutant}
                      stroke={POLLUTANT_COLORS[pollutant]}
                      strokeWidth={2.5}
                      dot={false}
                      name={`${pollutant} (${pollutant === 'CO' ? 'mg/m³' : 'µg/m³'})`}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={trends.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar
                    dataKey={pollutant}
                    fill={POLLUTANT_COLORS[pollutant]}
                    radius={[4, 4, 0, 0]}
                    name={`${pollutant} (${pollutant === 'CO' ? 'mg/m³' : 'µg/m³'})`}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No matching records for current filter selection
            </div>
          )}
        </div>
      </div>

      {/* Distribution & Peak Pollution Periods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Histogram & Statistical Summary */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              {pollutant} Concentration Distribution
            </h3>
            <p className="text-xs text-slate-400">Frequency histogram and central tendency metrics</p>
          </div>

          {/* Stats Bar */}
          {trends?.distribution?.stats && (
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">MIN</span>
                <span className="text-xs font-bold text-white font-mono">
                  {trends.distribution.stats.min}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">MEAN</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  {trends.distribution.stats.mean}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">MEDIAN</span>
                <span className="text-xs font-bold text-teal-300 font-mono">
                  {trends.distribution.stats.median}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">MAX</span>
                <span className="text-xs font-bold text-rose-400 font-mono">
                  {trends.distribution.stats.max}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">STD DEV</span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {trends.distribution.stats.std}
                </span>
              </div>
            </div>
          )}

          {/* Histogram Bar Chart */}
          <div className="h-48 w-full">
            {trends?.distribution?.bins?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.distribution.bins} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Observations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Distribution data unavailable
              </div>
            )}
          </div>
        </div>

        {/* Peak Pollution Periods Table */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              Top Peak Pollution Incidents
            </h3>
            <p className="text-xs text-slate-400">
              Highest recorded {pollutant} events requiring regulatory scrutiny
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Location / Station</th>
                  <th className="py-2.5 px-3 text-right">Concentration</th>
                  <th className="py-2.5 px-3 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {trends?.peaks?.map((peak, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-300">{peak.date}</td>
                    <td className="py-2.5 px-3 text-slate-200">
                      <div className="font-semibold">{peak.city}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{peak.station}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                      {peak.value} {pollutant === 'CO' ? 'mg/m³' : 'µg/m³'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Critical Spike
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
