import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

POLLUTANT_COLS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']

def detect_anomalies(df, contamination=0.05, city=None, station=None):
    """
    Applies Scikit-learn Isolation Forest to detect abnormal pollution multi-sensor outliers.
    """
    data = df.copy()
    
    if city and city != 'all' and 'City' in data.columns:
        data = data[data['City'] == city]
    if station and station != 'all' and 'Station' in data.columns:
        data = data[data['Station'] == station]
        
    available_pollutants = [p for p in POLLUTANT_COLS if p in data.columns and data[p].notna().sum() > 10]
    
    if len(available_pollutants) == 0:
        return {
            'total_analyzed': 0,
            'anomaly_count': 0,
            'anomaly_percentage': 0,
            'anomalies': [],
            'explanation': "No numerical pollutant columns available with sufficient data for anomaly detection."
        }
        
    # Impute temporary median for missing values during anomaly check so we don't drop rows
    X = data[available_pollutants].copy()
    for col in available_pollutants:
        col_median = X[col].median()
        if pd.isna(col_median):
            col_median = 0.0
        X[col] = X[col].fillna(col_median)
        
    # Fit Isolation Forest
    iso = IsolationForest(
        contamination=min(max(float(contamination), 0.01), 0.20),
        random_state=42,
        n_estimators=100
    )
    
    predictions = iso.fit_predict(X)
    anomaly_scores = iso.decision_function(X) # lower score means more anomalous
    
    data['is_anomaly'] = (predictions == -1)
    data['anomaly_score'] = np.round(anomaly_scores, 4)
    
    total_analyzed = len(data)
    anomaly_df = data[data['is_anomaly']].copy()
    anomaly_count = len(anomaly_df)
    anomaly_percentage = round((anomaly_count / total_analyzed * 100) if total_analyzed > 0 else 0, 2)
    
    # Sort by anomaly severity (most anomalous first)
    anomaly_df = anomaly_df.sort_values(by='anomaly_score', ascending=True)
    
    # Format top anomalies for UI (up to 100 records)
    anomalies_list = []
    for idx, row in anomaly_df.head(100).iterrows():
        # Identify which pollutant(s) had notable spikes relative to mean
        spikes = []
        for p in available_pollutants:
            val = row[p]
            mean_val = df[p].mean() if p in df.columns else val
            if pd.notna(val) and mean_val > 0 and val > (mean_val * 1.8):
                spikes.append(f"{p} ({val} µg/m³)")
                
        anomalies_list.append({
            'id': int(idx),
            'date': str(row.get('Date', 'N/A')),
            'city': str(row.get('City', 'N/A')),
            'station': str(row.get('Station', 'N/A')),
            'pm25': round(float(row.get('PM2.5', 0)), 2) if pd.notna(row.get('PM2.5')) else None,
            'pm10': round(float(row.get('PM10', 0)), 2) if pd.notna(row.get('PM10')) else None,
            'no2': round(float(row.get('NO2', 0)), 2) if pd.notna(row.get('NO2')) else None,
            'so2': round(float(row.get('SO2', 0)), 2) if pd.notna(row.get('SO2')) else None,
            'co': round(float(row.get('CO', 0)), 2) if pd.notna(row.get('CO')) else None,
            'o3': round(float(row.get('O3', 0)), 2) if pd.notna(row.get('O3')) else None,
            'anomaly_score': float(row['anomaly_score']),
            'detected_spikes': ", ".join(spikes) if spikes else "Multi-pollutant multivariate divergence"
        })
        
    return {
        'total_analyzed': total_analyzed,
        'anomaly_count': anomaly_count,
        'anomaly_percentage': anomaly_percentage,
        'contamination_used': float(contamination),
        'available_pollutants': available_pollutants,
        'anomalies': anomalies_list,
        'explanation': (
            "Detected anomalies represent multidimensional statistical outliers identified via an ensemble of randomized trees. "
            "These highlight sudden localized pollutant spikes, sensor drift, or unusual combustion events. "
            "They serve as triggers for investigation and are not automatically verified regulatory violations."
        )
    }
