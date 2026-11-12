import os
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from config import MODELS_DIR

FEATURE_CANDIDATES = ['PM10', 'NO2', 'SO2', 'CO', 'O3']

def prepare_ml_features(df):
    """
    Constructs clean, leak-free feature matrix for PM2.5 prediction.
    Features: Available co-pollutants + month + day_of_week + lag1 (if chronological).
    """
    data = df.copy()
    if 'PM2.5' not in data.columns:
        raise ValueError("Target column 'PM2.5' not found in dataset.")
        
    # Sort chronologically if Date exists
    if 'Date' in data.columns:
        data['Date'] = pd.to_datetime(data['Date'], errors='coerce')
        data = data.sort_values(by='Date').reset_index(drop=True)
        data['Month'] = data['Date'].dt.month.fillna(1).astype(int)
        data['DayOfWeek'] = data['Date'].dt.dayofweek.fillna(0).astype(int)
    else:
        data['Month'] = 1
        data['DayOfWeek'] = 0

    # Optional lag feature
    data['PM2.5_lag1'] = data['PM2.5'].shift(1)
    
    # Identify available features
    available_pollutants = [f for f in FEATURE_CANDIDATES if f in data.columns and data[f].notna().sum() > 20]
    features = list(available_pollutants) + ['Month', 'DayOfWeek', 'PM2.5_lag1']
    
    # Drop rows where target or features are completely NaN
    clean_data = data[['PM2.5'] + features].dropna()
    
    if len(clean_data) < 30:
        # Fallback without lag if dropping the first row or missing lags reduced dataset too much
        features = list(available_pollutants) + ['Month', 'DayOfWeek']
        clean_data = data[['PM2.5'] + features].dropna()
        
    if len(clean_data) < 30:
        raise ValueError(f"Insufficient valid rows for training (found {len(clean_data)} valid rows, minimum 30 required).")
        
    X = clean_data[features]
    y = clean_data['PM2.5']
    
    return X, y, features

def train_and_evaluate_models(df):
    """
    Trains Linear Regression and Random Forest Regressor using chronological 80/20 train-test split.
    Saves models and metadata using Joblib.
    """
    X, y, feature_names = prepare_ml_features(df)
    
    # Chronological train-test split (80% train, 20% test)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # 1. Linear Regression with StandardScaler (fitted ONLY on train)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    y_pred_lr = lr_model.predict(X_test_scaled)
    
    # Compute genuine metrics for Linear Regression
    lr_mae = mean_absolute_error(y_test, y_pred_lr)
    lr_rmse = np.sqrt(mean_squared_error(y_test, y_pred_lr))
    lr_r2 = r2_score(y_test, y_pred_lr)
    
    # 2. Random Forest Regressor
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    y_pred_rf = rf_model.predict(X_test)
    
    # Compute genuine metrics for Random Forest
    rf_mae = mean_absolute_error(y_test, y_pred_rf)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    rf_r2 = r2_score(y_test, y_pred_rf)
    
    # Feature importances from Random Forest
    importances = []
    for f, imp in zip(feature_names, rf_model.feature_importances_):
        importances.append({'feature': f, 'importance': round(float(imp), 4)})
    importances = sorted(importances, key=lambda x: x['importance'], reverse=True)
    
    # Actual vs Predicted sample pairs (max 40 points for visual clarity)
    test_dates = df.iloc[y_test.index]['Date'].astype(str).tolist() if 'Date' in df.columns else [f"Sample {i+1}" for i in range(len(y_test))]
    sample_indices = np.linspace(0, len(y_test) - 1, min(40, len(y_test)), dtype=int)
    
    actual_vs_predicted = []
    for idx in sample_indices:
        actual_vs_predicted.append({
            'index': int(idx),
            'label': test_dates[idx] if idx < len(test_dates) else f"T-{idx}",
            'actual': round(float(y_test.iloc[idx]), 2),
            'rf_predicted': round(float(y_pred_rf[idx]), 2),
            'lr_predicted': round(float(y_pred_lr[idx]), 2)
        })
        
    # Save models and metadata with Joblib
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(lr_model, os.path.join(MODELS_DIR, 'model_lr.joblib'))
    joblib.dump(rf_model, os.path.join(MODELS_DIR, 'model_rf.joblib'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))
    
    metadata = {
        'trained': True,
        'features': feature_names,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'linear_regression': {
            'mae': round(float(lr_mae), 2),
            'rmse': round(float(lr_rmse), 2),
            'r2': round(float(lr_r2), 4)
        },
        'random_forest': {
            'mae': round(float(rf_mae), 2),
            'rmse': round(float(rf_rmse), 2),
            'r2': round(float(rf_r2), 4)
        },
        'feature_importances': importances,
        'limitations': (
            "Models estimate ambient PM2.5 from co-pollutant concentrations and temporal indicators. "
            "They do not replace atmospheric numerical fluid dispersion or lidar measurements. "
            "Predictions are valid within the range of training observations and ambient weather conditions."
        )
    }
    joblib.dump(metadata, os.path.join(MODELS_DIR, 'metadata.joblib'))
    
    return {
        'status': 'success',
        'metrics': metadata,
        'actual_vs_predicted': actual_vs_predicted
    }

def get_training_status():
    meta_path = os.path.join(MODELS_DIR, 'metadata.joblib')
    if os.path.exists(meta_path):
        try:
            meta = joblib.load(meta_path)
            return meta
        except Exception:
            pass
    return {'trained': False}
