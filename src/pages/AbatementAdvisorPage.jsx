import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  CheckCircle2,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { getRecommendations } from '../services/api';

const POLLUTANT_ICONS = {
  'PM2.5': Wind,
  PM10: Droplets,
  NO2: Flame,
  SO2: Layers,
  CO: AlertTriangle,
  O3: Sparkles
};

export default function AbatementAdvisorPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPollutant, setSelectedPollutant] = useState('all');

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const filteredRecs = recommendations.filter((r) => {
    if (selectedPollutant === 'all') return true;
    return r.pollutant === selectedPollutant;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel p-5 rounded-2xl space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" /> AI Environmental Abatement & Mitigation Advisor
        </h2>
        <p className="text-xs text-slate-400">
          Explainable environmental engineering rule engine synthesizing proactive abatement interventions based on measured concentrations and CPCB National Ambient Air Quality Standards (NAAQS).
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 mr-2">FILTER POLLUTANT:</span>
        {['all', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPollutant(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedPollutant === p
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            {p === 'all' ? 'All Pollutants' : p}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecs.length > 0 ? (
          filteredRecs.map((rec, idx) => {
            const Icon = POLLUTANT_ICONS[rec.pollutant] || ShieldCheck;
            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl space-y-4 border-slate-700/60 hover:border-teal-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {rec.pollutant}
                        </span>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {rec.proposed_measure}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry vs Regulatory Standard Comparison */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">OBSERVED</span>
                      <span className="font-bold text-white">
                        {rec.observed_value} {rec.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">CPCB STANDARD</span>
                      <span className="font-bold text-slate-300">
                        {rec.reference_threshold} {rec.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">RISK LEVEL</span>
                      <span
                        className="font-bold"
                        style={{ color: rec.risk_color || '#10b981' }}
                      >
                        {rec.risk_level.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Scientific Mechanism */}
                  <div className="space-y-1 text-xs">
                    <span className="font-mono text-cyan-300 font-semibold block">
                      SCIENTIFIC RATIONALE & CHEMICAL MECHANISM:
                    </span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                      {rec.scientific_explanation}
                    </p>
                  </div>
                </div>

                {/* Expected Environmental Benefit */}
                <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-start gap-2.5 text-xs text-teal-200">
                  <TrendingDown className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-300 block">Projected Abatement Gain:</span>
                    <span>{rec.expected_benefit}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 glass-panel p-12 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Monitored Pollutants Within Regulatory Targets</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ambient concentrations comply with CPCB 24-hour National Ambient Air Quality Standards (NAAQS). Continuous CAAQMS telemetry surveillance is recommended.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
