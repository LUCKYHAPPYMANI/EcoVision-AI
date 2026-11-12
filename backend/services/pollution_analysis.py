import pandas as pd
import numpy as np
from config import CPCB_NAAQS_24HR, CPCB_AQI_BREAKPOINTS, AQI_CATEGORIES

POLLUTANTS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']

def calculate_sub_index(pollutant, concentration):
    """
    Computes CPCB sub-index for a specific pollutant concentration using official linear interpolation:
    Ip = [(I_hi - I_lo) / (B_hi - B_lo)] * (Cp - B_lo) + I_lo
    """
    if concentration is None or pd.isna(concentration) or concentration < 0:
        return None
    breakpoints = CPCB_AQI_BREAKPOINTS.get(pollutant)
    if not breakpoints:
        return None
        
    for (b_lo, b_hi, i_lo, i_hi) in breakpoints:
        if b_lo <= concentration <= b_hi:
            sub = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return round(sub, 1)
            
    # If exceeding max breakpoint
    if concentration > breakpoints[-1][1]:
        return 500.0
    return 0.0

def categorize_aqi(aqi_val):
    if aqi_val is None or pd.isna(aqi_val):
        return {'category': 'Unknown', 'color': '#9CA3AF', 'description': 'Insufficient data for AQI calculation'}
    for (low, high, cat, color, desc) in AQI_CATEGORIES:
        if low <= aqi_val <= high:
            return {'category': cat, 'color': color, 'description': desc}
    if aqi_val > 500:
        return {'category': 'Severe', 'color': '#7F1D1D', 'description': 'Hazardous levels exceeding measurable scale'}
    return {'category': 'Good', 'color': '#10B981', 'description': 'Air quality is satisfactory'}

def compute_row_aqi(row):
    """
    Computes overall CPCB AQI from a dataframe row:
    Calculates sub-indices for present pollutants. The maximum sub-index represents the AQI.
    """
    sub_indices = {}
    for p in POLLUTANTS:
        if p in row and pd.notna(row[p]):
            val = float(row[p])
            sub = calculate_sub_index(p, val)
            if sub is not None:
                sub_indices[p] = sub
                
    if not sub_indices:
        return None, None
        
    dominant_pollutant = max(sub_indices, key=sub_indices.get)
    max_aqi = sub_indices[dominant_pollutant]
    return max_aqi, dominant_pollutant

def get_dashboard_summary(df):
    """
    Generates dynamic calculated metrics from loaded dataset.
    """
    total_records = len(df)
    cities = int(df['City'].nunique()) if 'City' in df.columns else 1
    stations = int(df['Station'].nunique()) if 'Station' in df.columns else 1
    
    averages = {}
    highest_measurement = {'value': 0, 'pollutant': 'None', 'city': 'N/A', 'date': 'N/A'}
    
    for p in POLLUTANTS:
        if p in df.columns:
            valid_vals = df[p].dropna()
            if len(valid_vals) > 0:
                avg = float(valid_vals.mean())
                averages[p] = round(avg, 2)
                max_val = float(valid_vals.max())
                if max_val > highest_measurement['value']:
                    max_idx = df[p].idxmax()
                    highest_measurement = {
                        'value': round(max_val, 2),
                        'pollutant': p,
                        'city': str(df.loc[max_idx, 'City']) if 'City' in df.columns else 'N/A',
                        'station': str(df.loc[max_idx, 'Station']) if 'Station' in df.columns else 'N/A',
                        'date': str(df.loc[max_idx, 'Date']) if 'Date' in df.columns else 'N/A'
                    }
            else:
                averages[p] = None
        else:
            averages[p] = None
            
    # Compute sample AQI distribution
    risk_distribution = {'Good': 0, 'Satisfactory': 0, 'Moderate': 0, 'Poor': 0, 'Very Poor': 0, 'Severe': 0}
    # Calculate for rows (limit to 2000 random or first 2000 for speed if huge)
    sample_df = df if len(df) <= 5000 else df.sample(5000, random_state=42)
    
    aqi_values = []
    for _, row in sample_df.iterrows():
        aqi_val, _ = compute_row_aqi(row)
        if aqi_val is not None:
            aqi_values.append(aqi_val)
            cat = categorize_aqi(aqi_val)['category']
            if cat in risk_distribution:
                risk_distribution[cat] += 1
                
    # Top pollution affected locations
    top_locations = []
    if 'City' in df.columns and 'PM2.5' in df.columns:
        city_grp = df.groupby('City')['PM2.5'].agg(['mean', 'count']).reset_index()
        city_grp = city_grp[city_grp['count'] >= 3].sort_values(by='mean', ascending=False).head(5)
        for _, r in city_grp.iterrows():
            top_locations.append({
                'city': r['City'],
                'avg_pm25': round(float(r['mean']), 2),
                'records': int(r['count'])
            })
            
    return {
        'total_records': total_records,
        'cities_count': cities,
        'stations_count': stations,
        'averages': averages,
        'highest_measurement': highest_measurement,
        'risk_distribution': risk_distribution,
        'top_locations': top_locations
    }

def get_trends_and_analytics(df, city=None, station=None, pollutant='PM2.5', date_start=None, date_end=None):
    """
    Filters dataset and generates:
    1. Time series data
    2. City comparison
    3. Correlation matrix
    4. Distribution histogram data
    5. Peak pollution periods
    """
    filtered = df.copy()
    if 'Date' in filtered.columns:
        filtered['Date'] = pd.to_datetime(filtered['Date'], errors='coerce')
        if date_start:
            filtered = filtered[filtered['Date'] >= pd.to_datetime(date_start)]
        if date_end:
            filtered = filtered[filtered['Date'] <= pd.to_datetime(date_end)]
            
    if city and city != 'all' and 'City' in filtered.columns:
        filtered = filtered[filtered['City'] == city]
    if station and station != 'all' and 'Station' in filtered.columns:
        filtered = filtered[filtered['Station'] == station]
        
    # Sort chronologically
    if 'Date' in filtered.columns:
        filtered = filtered.sort_values(by='Date')
        
    # 1. Time-series aggregation
    time_series = []
    if 'Date' in filtered.columns:
        grouped = filtered.groupby(filtered['Date'].dt.strftime('%Y-%m-%d'))
        for date_str, grp in grouped:
            point = {'date': date_str}
            for p in POLLUTANTS:
                if p in grp.columns:
                    val = grp[p].dropna()
                    if len(val) > 0:
                        point[p] = round(float(val.mean()), 2)
            time_series.append(point)
            
    # Sample down if time series is excessively dense for frontend charting (max 150 points for smooth rendering)
    if len(time_series) > 150:
        step = len(time_series) // 150
        time_series = time_series[::step]
        
    # 2. City-wise comparison
    city_comparison = []
    if 'City' in df.columns:
        for c, grp in df.groupby('City'):
            entry = {'city': c}
            for p in POLLUTANTS:
                if p in grp.columns:
                    val = grp[p].dropna()
                    if len(val) > 0:
                        entry[p] = round(float(val.mean()), 2)
            if any(k in entry for k in POLLUTANTS):
                city_comparison.append(entry)
        city_comparison = sorted(city_comparison, key=lambda x: x.get('PM2.5', 0), reverse=True)[:10]

    # 3. Correlation heatmap matrix
    corr_matrix = {}
    available_pollutants = [p for p in POLLUTANTS if p in filtered.columns and filtered[p].notna().sum() > 5]
    if len(available_pollutants) >= 2:
        corr_df = filtered[available_pollutants].corr().round(2).fillna(0)
        corr_matrix = {
            'pollutants': available_pollutants,
            'matrix': corr_df.values.tolist()
        }

    # 4. Distribution stats for the selected pollutant
    distribution = {'bins': [], 'stats': {}}
    if pollutant in filtered.columns:
        p_series = filtered[pollutant].dropna()
        if len(p_series) > 0:
            hist, bin_edges = np.histogram(p_series, bins=10)
            bins = []
            for i in range(len(hist)):
                bins.append({
                    'range': f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}",
                    'count': int(hist[i])
                })
            distribution = {
                'bins': bins,
                'stats': {
                    'min': round(float(p_series.min()), 2),
                    'max': round(float(p_series.max()), 2),
                    'mean': round(float(p_series.mean()), 2),
                    'median': round(float(p_series.median()), 2),
                    'std': round(float(p_series.std()), 2) if len(p_series) > 1 else 0
                }
            }

    # 5. Peak pollution periods
    peaks = []
    if pollutant in filtered.columns and 'Date' in filtered.columns:
        top_peak_rows = filtered.sort_values(by=pollutant, ascending=False).head(5)
        for _, r in top_peak_rows.iterrows():
            peaks.append({
                'date': r['Date'].strftime('%Y-%m-%d') if pd.notna(r['Date']) else 'N/A',
                'city': str(r.get('City', 'N/A')),
                'station': str(r.get('Station', 'N/A')),
                'value': round(float(r[pollutant]), 2)
            })

    return {
        'time_series': time_series,
        'city_comparison': city_comparison,
        'correlation': corr_matrix,
        'distribution': distribution,
        'peaks': peaks,
        'cities': df['City'].dropna().unique().tolist() if 'City' in df.columns else [],
        'stations': df['Station'].dropna().unique().tolist() if 'Station' in df.columns else []
    }
