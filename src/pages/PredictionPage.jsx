import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  BarChart3,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
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
import { trainModels, getModelStatus, predictPM25 } from '../services/api';

export default function PredictionPage({ setNotification }) {
  const [modelStatus, setModelStatus] = useState(null);
  const [actualVsPredicted, setActualVsPredicted] = useState([]);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Form inputs for PM2.5 prediction
  const [inputs, setInputs] = useState({
    PM10: 95.0,
    NO2: 38.0,
    SO2: 18.0,
    CO: 1.2,
    O3: 28.0,
    Month: 5,
    DayOfWeek: 2
  });

  const fetchStatus = async () => {
    try {
      const res = await getModelStatus();
      setModelStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    try {
      const res = await trainModels();
      setModelStatus(res.metrics);
      setActualVsPredicted(res.actual_vs_predicted || []);
      setNotification({
        type: 'success',
        message: 'Successfully trained Linear Regression and Random Forest Regressor models on holdout test split.'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to train machine learning models.'
      });
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await predictPM25(inputs);
      setPredictionResult(res);
      setNotification({
        type: 'success',
        message: `Inference complete. Predicted PM2.5: ${res.predicted_pm25} µg/m³ (${res.risk_category}).`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Prediction failed. Ensure models are trained first.'
      });
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Train Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl glass-panel gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> Machine Learning PM2.5 Prediction Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Random Forest Regressor & Ordinary Least Squares (OLS) trained with chronological holdout validation to eliminate data leakage.
          </p>
        </div>

        <button
          onClick={handleTrain}
          disabled={training}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all shrink-0"
        >
          {training ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Training Models...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Train / Retrain AI Models
            </>
          )}
        </button>
      </div>

      {/* Model Performance Comparison Grid */}
      {modelStatus?.trained ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linear Regression Metrics Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                  Baseline Model
                </span>
                <h3 className="text-base font-bold text-white">Linear Regression (OLS)</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                StandardScaler
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">MAE</span>
                <span className="text-lg font-bold text-white font-mono">
                  {modelStatus.linear_regression?.mae}
                </span>
                <span className="text-[10px] text-slate-500 block">µg/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">RMSE</span>
                <span className="text-lg font-bold text-white font-mono">
                  {modelStatus.linear_regression?.rmse}
                </span>
                <span className="text-[10px] text-slate-500 block">µg/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">R² SCORE</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {modelStatus.linear_regression?.r2}
                </span>
                <span className="text-[10px] text-slate-500 block">Variance Expl.</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates linear combinations of co-pollutants. Provides an interpretable statistical baseline.
            </p>
          </div>

          {/* Random Forest Metrics Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border-teal-500/30 bg-teal-950/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-teal-400 font-semibold uppercase">
                  Primary Model
                </span>
                <h3 className="text-base font-bold text-white">Random Forest Regressor</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-teal-950/60 text-teal-300 border border-teal-500/30">
                100 Estimators
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">MAE</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {modelStatus.random_forest?.mae}
                </span>
                <span className="text-[10px] text-slate-500 block">µg/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">RMSE</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {modelStatus.random_forest?.rmse}
                </span>
                <span className="text-[10px] text-slate-500 block">µg/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">R² SCORE</span>
                <span className="text-lg font-bold text-emerald-300 font-mono">
                  {modelStatus.random_forest?.r2}
                </span>
                <span className="text-[10px] text-slate-500 block">Variance Expl.</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Captures complex non-linear atmospheric interactions and threshold behaviors between co-pollutants.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
          <Cpu className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Models Not Yet Trained On Current Telemetry</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click 'Train / Retrain AI Models' above to execute the 80/20 chronological split and train both algorithms.
          </p>
        </div>
      )}

      {/* Feature Importance & Actual vs Predicted Visuals */}
      {modelStatus?.trained && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Importance Bar Chart */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Random Forest Feature Importance
              </h3>
              <p className="text-xs text-slate-400">Gini impurity reduction across feature splits</p>
            </div>
            <div className="h-64 w-full">
              {modelStatus.feature_importances?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modelStatus.feature_importances}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="importance" fill="#14b8a6" radius={[0, 4, 4, 0]} name="Relative Importance" />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          {/* Actual vs Predicted Curve */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Validation Fit: Actual vs Predicted PM2.5
              </h3>
              <p className="text-xs text-slate-400">Holdout evaluation sample series (µg/m³)</p>
            </div>
            <div className="h-64 w-full">
              {actualVsPredicted.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={actualVsPredicted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
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
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} name="Actual PM2.5" />
                    <Line type="monotone" dataKey="rf_predicted" stroke="#10b981" strokeWidth={2} dot={false} name="Random Forest" />
                    <Line type="monotone" dataKey="lr_predicted" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Linear Reg" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  Run model training to populate validation trajectory
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive PM2.5 Calculator Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> Interactive PM2.5 Concentration Estimator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Specify observed co-pollutant telemetry and calendar attributes to estimate the expected ambient PM2.5 concentration, CPCB AQI sub-index, and health risk category.
          </p>
        </div>

        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* PM10 Slider/Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">PM10 (µg/m³)</span>
                <span className="font-mono font-bold text-cyan-400">{inputs.PM10}</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="1"
                value={inputs.PM10}
                onChange={(e) => setInputs({ ...inputs, PM10: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* NO2 Slider/Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">NO2 (µg/m³)</span>
                <span className="font-mono font-bold text-rose-400">{inputs.NO2}</span>
              </div>
              <input
                type="range"
                min="2"
                max="250"
                step="1"
                value={inputs.NO2}
                onChange={(e) => setInputs({ ...inputs, NO2: parseFloat(e.target.value) })}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* SO2 Slider/Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">SO2 (µg/m³)</span>
                <span className="font-mono font-bold text-purple-400">{inputs.SO2}</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                step="1"
                value={inputs.SO2}
                onChange={(e) => setInputs({ ...inputs, SO2: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* CO Slider/Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">CO (mg/m³)</span>
                <span className="font-mono font-bold text-emerald-400">{inputs.CO}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15.0"
                step="0.1"
                value={inputs.CO}
                onChange={(e) => setInputs({ ...inputs, CO: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* O3 Slider/Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">O3 (µg/m³)</span>
                <span className="font-mono font-bold text-pink-400">{inputs.O3}</span>
              </div>
              <input
                type="range"
                min="2"
                max="200"
                step="1"
                value={inputs.O3}
                onChange={(e) => setInputs({ ...inputs, O3: parseFloat(e.target.value) })}
                className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Month Selector */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-xs font-mono text-slate-400 block">MONTH</label>
              <select
                value={inputs.Month}
                onChange={(e) => setInputs({ ...inputs, Month: parseInt(e.target.value) })}
                className="w-full text-xs bg-slate-950 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m} (Month {idx + 1})
                  </option>
                ))}
              </select>
            </div>

            {/* Day of Week */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-xs font-mono text-slate-400 block">DAY OF WEEK</label>
              <select
                value={inputs.DayOfWeek}
                onChange={(e) => setInputs({ ...inputs, DayOfWeek: parseInt(e.target.value) })}
                className="w-full text-xs bg-slate-950 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, idx) => (
                  <option key={d} value={idx}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={predicting}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Calculate PM2.5 Prediction
              </button>
            </div>
          </div>
        </form>

        {/* Prediction Output Card */}
        {predictionResult && (
          <div className="p-5 rounded-2xl glass-card-accent border-cyan-500/40 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 tracking-wider font-semibold">
                  ESTIMATED CONCENTRATION
                </span>
                <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span>{predictionResult.predicted_pm25}</span>
                  <span className="text-sm font-normal text-slate-400">µg/m³ PM2.5</span>
                </div>
              </div>

              <div
                className="px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2"
                style={{
                  backgroundColor: `${predictionResult.risk_color}20`,
                  borderColor: `${predictionResult.risk_color}60`,
                  color: predictionResult.risk_color
                }}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{predictionResult.risk_category} Risk</span>
                <span className="font-mono text-xs opacity-80">(Sub-Index: {predictionResult.sub_index})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-mono text-slate-400 block mb-1">MODEL COMPARISON:</span>
                <div className="flex justify-between text-slate-200">
                  <span>Random Forest:</span>
                  <span className="font-bold font-mono text-emerald-400">{predictionResult.rf_prediction} µg/m³</span>
                </div>
                <div className="flex justify-between text-slate-200 mt-1">
                  <span>Linear Regression:</span>
                  <span className="font-bold font-mono text-amber-400">{predictionResult.lr_prediction} µg/m³</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-mono text-slate-400 block mb-1">HEALTH ADVISORY:</span>
                <p className="text-slate-300 leading-relaxed">{predictionResult.health_impact}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-mono">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{predictionResult.distinction_note}</span>
            </div>
          </div>
        )}

        {/* Model Limitations Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300 block mb-0.5">Scientific Scope & Limitations:</span>
            Machine learning models estimate ambient particulate concentrations based on statistical co-variance with gaseous co-pollutants and temporal seasonality. They do not simulate micro-scale boundary layer fluid mechanics or atmospheric advection-dispersion plume physics.
          </div>
        </div>
      </div>
    </div>
  );
}
