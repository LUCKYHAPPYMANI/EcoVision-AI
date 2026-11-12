import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Heart,
  Wind,
  Info,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Layers
} from 'lucide-react';
import { getRiskAssessment } from '../services/api';

export default function RiskAssessmentPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom interactive AQI simulator inputs
  const [simValues, setSimValues] = useState({
    'PM2.5': 75.0,
    PM10: 140.0,
    NO2: 45.0,
    SO2: 25.0,
    CO: 1.5,
    O3: 35.0
  });

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await getRiskAssessment();
      setRiskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  // CPCB linear interpolation helper for simulator
  const computeSubIndex = (pollutant, concentration) => {
    const breakpoints = riskData?.cpcb_breakpoints?.[pollutant];
    if (!breakpoints || concentration < 0) return 0;
    for (const [bLo, bHi, iLo, iHi] of breakpoints) {
      if (concentration >= bLo && concentration <= bHi) {
        return Math.round(((iHi - iLo) / (bHi - bLo)) * (concentration - bLo) + iLo);
      }
    }
    if (concentration > breakpoints[breakpoints.length - 1][1]) return 500;
    return 0;
  };

  // Compute simulator sub-indices
  const simSubIndices = {};
  Object.entries(simValues).forEach(([p, val]) => {
    simSubIndices[p] = computeSubIndex(p, val);
  });
  const dominantPollutant = Object.keys(simSubIndices).reduce((a, b) =>
    simSubIndices[a] > simSubIndices[b] ? a : b
  );
  const overallAQI = simSubIndices[dominantPollutant] || 0;

  const getCategoryInfo = (aqi) => {
    if (aqi <= 50) return { name: 'Good', color: '#10B981', advisory: 'Minimal health impact. Air quality is satisfactory.' };
    if (aqi <= 100) return { name: 'Satisfactory', color: '#34D399', advisory: 'Minor breathing discomfort to sensitive individuals.' };
    if (aqi <= 200) return { name: 'Moderate', color: '#FBBF24', advisory: 'Breathing discomfort to individuals with lung diseases such as asthma and heart ailments.' };
    if (aqi <= 300) return { name: 'Poor', color: '#F97316', advisory: 'Breathing discomfort to most people on prolonged exposure.' };
    if (aqi <= 400) return { name: 'Very Poor', color: '#EF4444', advisory: 'Respiratory illness on prolonged exposure. Significant risk to vulnerable groups.' };
    return { name: 'Severe', color: '#7F1D1D', advisory: 'Affects healthy individuals and severely impacts those with pre-existing cardiopulmonary disorders.' };
  };

  const simCategory = getCategoryInfo(overallAQI);

  return (
    <div className="space-y-6">
      {/* Page Title & CPCB Framework Header */}
      <div className="glass-panel p-5 rounded-2xl space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" /> CPCB Air Quality Index & Health Risk Assessment
        </h2>
        <p className="text-xs text-slate-400">
          Evaluates multi-pollutant concentrations using official Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) piecewise linear sub-index interpolation.
        </p>
      </div>

      {/* Critical Distinction Banner */}
      <div className="p-4 rounded-xl glass-card-accent border-cyan-500/40 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-cyan-300 block">Crucial Regulatory Distinction:</span>
          <p>
            An AI PM2.5 prediction is an <b>estimated concentration</b> modeled from statistical relationships. It is <b>not an official CPCB certified AQI station observation</b>. Official AQI requires verified continuous physical telemetry meeting National Ambient Air Quality Standards (NAAQS) protocol.
          </p>
        </div>
      </div>

      {/* Active Dataset Overview Sub-indices */}
      {riskData?.averages && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white tracking-wide">
            Observed Dataset Mean Pollutant Sub-Indices
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(riskData.averages).map(([p, avgVal]) => {
              const subIdx = avgVal !== null ? computeSubIndex(p, avgVal) : null;
              const cat = subIdx !== null ? getCategoryInfo(subIdx) : null;
              return (
                <div key={p} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{p}</span>
                    <span className="font-bold text-white">{avgVal ?? 'N/A'}</span>
                  </div>
                  <div className="text-xs font-bold font-mono" style={{ color: cat?.color || '#94a3b8' }}>
                    Sub-Index: {subIdx ?? 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Category: <span className="font-medium text-slate-200">{cat?.name || 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive CPCB AQI Calculator Simulator */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> Interactive CPCB AQI & Sub-Index Calculator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Adjust individual pollutant concentrations to evaluate sub-indices, identify the dominant pollutant, and inspect health impact advisories.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(simValues).map(([p, val]) => (
            <div key={p} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">{p} ({p === 'CO' ? 'mg/m³' : 'µg/m³'})</span>
                <span className="font-bold text-cyan-400">{val}</span>
              </div>
              <input
                type="range"
                min="0"
                max={p === 'CO' ? '20' : '400'}
                step={p === 'CO' ? '0.1' : '1'}
                value={val}
                onChange={(e) => setSimValues({ ...simValues, [p]: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Sub-Index:</span>
                <span className="font-bold text-white">{simSubIndices[p]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calculated Overall AQI Result Card */}
        <div className="p-6 rounded-2xl glass-card-accent border-cyan-500/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                COMPUTED CPCB NATIONAL AIR QUALITY INDEX
              </span>
              <div className="text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-3 mt-1">
                <span>{overallAQI}</span>
                <span className="text-sm font-normal text-slate-400">AQI Points</span>
              </div>
            </div>

            <div
              className="px-5 py-2.5 rounded-xl border text-base font-bold flex items-center gap-2"
              style={{
                backgroundColor: `${simCategory.color}20`,
                borderColor: `${simCategory.color}60`,
                color: simCategory.color
              }}
            >
              <Heart className="w-5 h-5" />
              <span>{simCategory.name} Category</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-mono text-slate-400 block mb-1">DOMINANT POLLUTANT:</span>
              <p className="text-slate-200 text-sm">
                <span className="font-bold text-cyan-300">{dominantPollutant}</span> dictates the overall AQI (Sub-index: {simSubIndices[dominantPollutant]}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-mono text-slate-400 block mb-1">HEALTH RISK ADVISORY:</span>
              <p className="text-slate-300 leading-relaxed">{simCategory.advisory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Official CPCB Breakpoints Reference Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> Official CPCB AQI Breakpoint Reference Schedule
        </h3>
        <p className="text-xs text-slate-400">
          Interpolation boundaries established under Ministry of Environment, Forest and Climate Change guidelines.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">AQI Range</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">PM2.5 (24hr)</th>
                <th className="py-2.5 px-3">PM10 (24hr)</th>
                <th className="py-2.5 px-3">NO2 (24hr)</th>
                <th className="py-2.5 px-3">SO2 (24hr)</th>
                <th className="py-2.5 px-3">CO (8hr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-400">0 - 50</td>
                <td className="py-2.5 px-3 font-semibold">Good</td>
                <td className="py-2.5 px-3">0 - 30</td>
                <td className="py-2.5 px-3">0 - 50</td>
                <td className="py-2.5 px-3">0 - 40</td>
                <td className="py-2.5 px-3">0 - 40</td>
                <td className="py-2.5 px-3">0 - 1.0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-teal-400">51 - 100</td>
                <td className="py-2.5 px-3 font-semibold">Satisfactory</td>
                <td className="py-2.5 px-3">31 - 60</td>
                <td className="py-2.5 px-3">51 - 100</td>
                <td className="py-2.5 px-3">41 - 80</td>
                <td className="py-2.5 px-3">41 - 80</td>
                <td className="py-2.5 px-3">1.1 - 2.0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-400">101 - 200</td>
                <td className="py-2.5 px-3 font-semibold">Moderate</td>
                <td className="py-2.5 px-3">61 - 90</td>
                <td className="py-2.5 px-3">101 - 250</td>
                <td className="py-2.5 px-3">81 - 180</td>
                <td className="py-2.5 px-3">81 - 380</td>
                <td className="py-2.5 px-3">2.1 - 10.0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-orange-400">201 - 300</td>
                <td className="py-2.5 px-3 font-semibold">Poor</td>
                <td className="py-2.5 px-3">91 - 120</td>
                <td className="py-2.5 px-3">251 - 350</td>
                <td className="py-2.5 px-3">181 - 280</td>
                <td className="py-2.5 px-3">381 - 800</td>
                <td className="py-2.5 px-3">10.1 - 17.0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-rose-500">301 - 400</td>
                <td className="py-2.5 px-3 font-semibold">Very Poor</td>
                <td className="py-2.5 px-3">121 - 250</td>
                <td className="py-2.5 px-3">351 - 430</td>
                <td className="py-2.5 px-3">281 - 400</td>
                <td className="py-2.5 px-3">801 - 1600</td>
                <td className="py-2.5 px-3">17.1 - 34.0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-red-700">401 - 500</td>
                <td className="py-2.5 px-3 font-semibold">Severe</td>
                <td className="py-2.5 px-3">250+</td>
                <td className="py-2.5 px-3">430+</td>
                <td className="py-2.5 px-3">400+</td>
                <td className="py-2.5 px-3">1600+</td>
                <td className="py-2.5 px-3">34.0+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
