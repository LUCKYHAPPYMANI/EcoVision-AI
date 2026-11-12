import os
import joblib
import pandas as pd
import numpy as np
from config import MODELS_DIR
from services.pollution_analysis import calculate_sub_index, categorize_aqi

def predict_pm25(input_features):
    """
    Predicts PM2.5 concentration using saved Linear Regression and Random Forest models.
    Calculates sub-index and health risk.
    """
    meta_path = os.path.join(MODELS_DIR, 'metadata.joblib')
    rf_path = os.path.join(MODELS_DIR, 'model_rf.joblib')
    lr_path = os.path.join(MODELS_DIR, 'model_lr.joblib')
    scaler_path = os.path.join(MODELS_DIR, 'scaler.joblib')
    
    if not (os.path.exists(meta_path) and os.path.exists(rf_path) and os.path.exists(lr_path)):
        raise RuntimeError("Machine learning models are not yet trained. Please train models on the dataset first.")
        
    meta = joblib.load(meta_path)
    rf_model = joblib.load(rf_path)
    lr_model = joblib.load(lr_path)
    scaler = joblib.load(scaler_path)
    
    feature_names = meta.get('features', [])
    
    # Construct input dataframe
    row_data = {}
    for f in feature_names:
        if f in input_features:
            try:
                row_data[f] = float(input_features[f])
            except (ValueError, TypeError):
                row_data[f] = 0.0
        elif f == 'Month':
            row_data[f] = int(input_features.get('Month', 1))
        elif f == 'DayOfWeek':
            row_data[f] = int(input_features.get('DayOfWeek', 0))
        elif f == 'PM2.5_lag1':
            row_data[f] = float(input_features.get('PM2.5_lag1', input_features.get('PM10', 50.0) * 0.5))
        else:
            row_data[f] = 0.0
            
    df_input = pd.DataFrame([row_data])[feature_names]
    
    # Random Forest prediction
    rf_pred = max(0.0, float(rf_model.predict(df_input)[0]))
    
    # Linear Regression prediction
    df_input_scaled = scaler.transform(df_input)
    lr_pred = max(0.0, float(lr_model.predict(df_input_scaled)[0]))
    
    # Primary prediction uses Random Forest (non-linear regressor with higher fidelity)
    selected_pm25 = round(rf_pred, 2)
    lr_val = round(lr_pred, 2)
    
    # Calculate CPCB sub-index for predicted PM2.5
    sub_index = calculate_sub_index('PM2.5', selected_pm25)
    risk_info = categorize_aqi(sub_index)
    
    return {
        'predicted_pm25': selected_pm25,
        'rf_prediction': selected_pm25,
        'lr_prediction': lr_val,
        'sub_index': sub_index,
        'risk_category': risk_info['category'],
        'risk_color': risk_info['color'],
        'health_impact': risk_info['description'],
        'input_features_used': row_data,
        'distinction_note': "This is a concentration estimation based on measured co-pollutants and temporal features, not an official regulatory measurement."
    }
