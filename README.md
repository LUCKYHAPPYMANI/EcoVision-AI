# ECOVISION AI
### AI-Powered Air Pollution Monitoring, Prediction and Abatement System
**University-Level CSE (AIML) & Environmental Engineering Assessment Project**

---

## 1. System Overview
EcoVision AI is an intelligent environmental monitoring and abatement platform that bridges data science with atmospheric and industrial engineering. The platform ingests authentic air-quality telemetry, sanitizes sensor errors, isolates multi-sensor statistical anomalies using machine learning, predicts ambient fine particulate (PM2.5) concentrations, and synthesizes verifiable, science-backed industrial abatement strategies based on official Central Pollution Control Board (CPCB) standards.

---

## 2. Architecture & Tech Stack

### Frontend:
- **React.js 18** (Modern component-driven architecture)
- **Vite 5** (High-performance build tooling & hot-module replacement)
- **Tailwind CSS 3** (Custom futuristic glassmorphism theme, deep navy palette, neon accents)
- **Recharts** (Interactive time-series area charts, comparative bar graphs, correlation matrix, distribution histograms, risk donut charts)
- **Lucide React** (Consistent iconography)
- **Axios** (REST API client)

### Backend:
- **Python 3** & **Flask** (Microservice REST API architecture)
- **Flask-CORS** (Secure cross-origin resource sharing)

### Data Science & Machine Learning:
- **Pandas & NumPy** (High-throughput environmental array operations & data cleaning)
- **Scikit-learn**:
  - **Random Forest Regressor** (Ensemble tree non-linear PM2.5 estimation)
  - **Ordinary Least Squares (OLS) Linear Regression** with **StandardScaler**
  - **Isolation Forest** (Unsupervised multivariate anomaly detection)
- **Joblib** (Serialized model persistence)

### Reporting & Database:
- **ReportLab** & **Matplotlib** (Automated multi-page PDF analytical report generation with embedded charts)
- **CSV Data Hub** (Downloadable cleaned datasets, anomaly logs, and prediction exports)

---

## 3. Implemented Website Pages

1. **Main Dashboard**: Real-time KPI widgets (total observations, cities, stations, pollutant averages, peak spike alarm), interactive PM2.5/PM10 trajectory, CPCB AQI risk donut chart, city-wise comparative rankings, and multi-pollutant Pearson correlation heatmap.
2. **Data Explorer**: Drag-and-drop CSV upload, file validation, automatic column mapping (`pm2_5`, `NO_2` -> `PM2.5`, `NO2`), missing value analysis, negative sensor value detection, automated deduplication and median imputation pipeline, before/after audit log, and downloadable cleaned CSV.
3. **Pollution Analytics**: Dynamic multi-parameter filtering (by pollutant, city, station), chart type switching (Area, Line, Bar), multi-pollutant overlay, statistical distribution histogram (min, max, mean, median, std dev), and peak pollution periods table.
4. **AI Prediction**: Chronological 80/20 train-test split execution, comparative evaluation metrics (MAE, RMSE, R²), Random Forest feature importance bar chart, holdout actual-vs-predicted trajectory, and interactive PM2.5 calculator with CPCB sub-index and health risk calculation.
5. **Anomaly Detection**: Scikit-learn Isolation Forest with configurable contamination slider (1% to 15%), multivariate outlier isolation, anomaly table with identified pollutant spike attributes, and search filtering.
6. **Pollution Risk Assessment**: Official CPCB NAQI piecewise linear sub-index interpolation, dominant pollutant identification, risk category schedule (Good to Severe), and regulatory distinction disclosures.
7. **AI Abatement Advisor**: Explainable rule engine generating targeted industrial/municipal interventions for PM2.5, PM10, NO2, SO2, CO, and O3 with scientific chemical mechanisms, reference standards, and projected environmental benefits.
8. **Report Generator**: One-click ReportLab PDF report generation embedding data dictionaries, summary statistics, trend plots, ML metrics, anomaly findings, and abatement recommendations. Includes downloadable Cleaned CSV, Anomaly CSV, and Prediction CSV.
9. **About Project**: In-depth academic documentation detailing problem statement, existing vs proposed systems, mathematical formulations, ethical considerations, and regulatory references.

---

## 4. Dataset Provenance & Management

The platform includes two distinct dataset categories:
1. **Authentic CPCB Datasets**: Genuine historical monitoring records from Central Pollution Control Board CAAQMS stations in Indian metropolitan centers (including Chennai, Delhi, Bengaluru, Hyderabad, Mumbai) with parameters: `PM2.5`, `PM10`, `NO2`, `SO2`, `CO`, `O3`, `City`, `Station`, `Date`.
2. **Clearly Labelled Synthetic Demo Dataset** (`demo_air_quality_labeled_synthetic.csv`): 121 rows with deliberate edge cases (missing values, negative values, duplicate rows, and extreme spikes) specifically provided for testing and auditing the cleaning and anomaly detection pipelines.

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup & Execution
```bash
# 1. Navigate to the backend directory
cd EcoVision-AI/backend

# 2. Install Python dependencies
python -m pip install -r requirements.txt

# 3. Run automated test suite
python -m pytest tests/test_backend.py -v

# 4. Start the Flask REST API server (port 5000)
python app.py
```

### Frontend Setup & Execution
```bash
# 1. Navigate to the frontend directory
cd EcoVision-AI/frontend

# 2. Install npm dependencies
npm install

# 3. Start the Vite development server (port 5173)
npm run dev
```

The application will be accessible at:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 6. Automated Testing Suite

The project includes an automated `pytest` suite in `backend/tests/test_backend.py` covering:
- CPCB piecewise sub-index linear interpolation
- Data cleaning, negative value correction, and median imputation
- Machine learning model training, metrics (MAE, RMSE, R²), and inference
- Isolation Forest anomaly detection
- Environmental abatement rule synthesis
- ReportLab PDF compilation and buffer generation
- Flask REST API endpoints (`/api/health`, `/api/summary`, `/api/recommendations`, etc.)

Execute tests via:
```bash
python -m pytest backend/tests/test_backend.py -v
```
All 7 unit and integration tests execute and pass cleanly.

---

## 7. Regulatory Standards Grounding
All calculations conform to:
- Central Pollution Control Board (CPCB) *National Air Quality Index (NAQI) Standard Report*, 2014.
- CPCB *National Ambient Air Quality Standards (NAAQS)* 24-hour limits:
  - **PM2.5**: 60.0 µg/m³
  - **PM10**: 100.0 µg/m³
  - **NO2**: 80.0 µg/m³
  - **SO2**: 80.0 µg/m³
  - **CO**: 2.0 mg/m³
  - **O3**: 100.0 µg/m³
- World Health Organization (WHO) *Global Air Quality Guidelines*, 2021.
