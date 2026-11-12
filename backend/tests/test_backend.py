import os
import sys
import pytest
import pandas as pd
import numpy as np

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import config
from app import app
from services.data_cleaning import analyze_raw_dataset, clean_dataset
from services.pollution_analysis import calculate_sub_index, categorize_aqi, compute_row_aqi, get_dashboard_summary
from services.model_training import train_and_evaluate_models, get_training_status
from services.prediction import predict_pm25
from services.anomaly_detection import detect_anomalies
from services.recommendation_engine import generate_recommendations
from services.report_generator import create_pdf_report

@pytest.fixture
def sample_test_df():
    """Generates synthetic dataframe for testing."""
    np.random.seed(42)
    dates = pd.date_range(start='2024-01-01', periods=60, freq='D')
    return pd.DataFrame({
        'Date': dates.strftime('%Y-%m-%d'),
        'City': ['TestCity'] * 60,
        'Station': ['TestStation-1'] * 60,
        'PM2.5': np.random.uniform(20, 150, 60),
        'PM10': np.random.uniform(40, 250, 60),
        'NO2': np.random.uniform(15, 90, 60),
        'SO2': np.random.uniform(5, 50, 60),
        'CO': np.random.uniform(0.5, 3.5, 60),
        'O3': np.random.uniform(10, 80, 60)
    })

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_cpcb_sub_index_calculation():
    # Good range: PM2.5 = 15 -> sub-index between 0 and 50
    sub_15 = calculate_sub_index('PM2.5', 15.0)
    assert 20 <= sub_15 <= 30
    
    # Moderate range: PM2.5 = 75 -> sub-index between 101 and 200
    sub_75 = calculate_sub_index('PM2.5', 75.0)
    assert 140 <= sub_75 <= 160
    
    # Categorization test
    cat = categorize_aqi(sub_75)
    assert cat['category'] == 'Moderate'

def test_data_cleaning_pipeline(tmp_path):
    # Create raw CSV with deliberate errors
    raw_csv = tmp_path / "raw_test.csv"
    raw_df = pd.DataFrame({
        'date': ['2024-01-01', '2024-01-01', '2024-01-02', '2024-01-03'],
        'pm2_5': [55.0, 55.0, -10.0, np.nan],
        'pm10': [110.0, 110.0, 95.0, 120.0],
        'no2': [45.0, 45.0, 40.0, np.nan]
    })
    raw_df.to_csv(raw_csv, index=False)
    
    analysis = analyze_raw_dataset(str(raw_csv))
    assert analysis['total_records'] == 4
    assert analysis['duplicate_count'] == 1
    assert 'PM2.5' in analysis['negative_stats']
    
    out_csv = tmp_path / "cleaned_test.csv"
    clean_res = clean_dataset(str(raw_csv), str(out_csv))
    
    assert clean_res['duplicates_removed'] == 1
    assert clean_res['negatives_corrected'] == 1
    assert clean_res['missing_values_imputed'] >= 2
    
    cleaned_df = pd.read_csv(out_csv)
    assert len(cleaned_df) == 3
    assert (cleaned_df['PM2.5'] < 0).sum() == 0
    assert cleaned_df['PM2.5'].isna().sum() == 0

def test_ml_model_training_and_prediction(sample_test_df):
    train_res = train_and_evaluate_models(sample_test_df)
    assert train_res['status'] == 'success'
    
    metrics = train_res['metrics']
    assert 'linear_regression' in metrics
    assert 'random_forest' in metrics
    assert metrics['linear_regression']['mae'] > 0
    assert metrics['random_forest']['mae'] > 0
    assert len(metrics['feature_importances']) > 0
    
    # Run test prediction
    input_data = {
        'PM10': 90.0,
        'NO2': 45.0,
        'SO2': 18.0,
        'CO': 1.2,
        'O3': 30.0,
        'Month': 5,
        'DayOfWeek': 2
    }
    pred_res = predict_pm25(input_data)
    assert 'predicted_pm25' in pred_res
    assert pred_res['predicted_pm25'] > 0
    assert pred_res['risk_category'] in ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']

def test_anomaly_detection(sample_test_df):
    # Inject a massive spike
    sample_test_df.loc[10, 'PM2.5'] = 600.0
    sample_test_df.loc[10, 'PM10'] = 800.0
    
    res = detect_anomalies(sample_test_df, contamination=0.05)
    assert res['total_analyzed'] == 60
    assert res['anomaly_count'] > 0
    assert len(res['anomalies']) > 0

def test_recommendation_engine():
    # Elevated PM2.5 and PM10
    pollutant_data = {
        'PM2.5': 125.0, # NAAQS is 60.0
        'PM10': 220.0,  # NAAQS is 100.0
        'NO2': 30.0,
        'SO2': 20.0,
        'CO': 0.8,
        'O3': 40.0
    }
    recs = generate_recommendations(pollutant_data)
    assert len(recs) >= 2
    
    # Check recommendations contains PM2.5 measure
    pm25_recs = [r for r in recs if r['pollutant'] == 'PM2.5']
    assert len(pm25_recs) > 0
    assert "Filtration" in pm25_recs[0]['proposed_measure']
    assert pm25_recs[0]['risk_level'].startswith("Critical")

def test_pdf_report_generation(sample_test_df, tmp_path):
    report_path, filename = create_pdf_report(sample_test_df, "test_report.pdf")
    assert os.path.exists(report_path)
    assert os.path.getsize(report_path) > 5000 # Valid PDF with pages and embedded chart

def test_api_endpoints(client):
    # 1. Health
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    
    # 2. Summary
    res = client.get('/api/summary')
    assert res.status_code == 200
    data = res.get_json()
    assert 'total_records' in data
    assert 'averages' in data
    
    # 3. Recommendations
    res = client.get('/api/recommendations')
    assert res.status_code == 200
    data = res.get_json()
    assert 'recommendations' in data
