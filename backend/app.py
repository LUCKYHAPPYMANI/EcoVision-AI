import os
import io
import datetime
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS

import config
from utils.validators import allowed_file, sanitize_filename
from services.data_cleaning import analyze_raw_dataset, clean_dataset
from services.pollution_analysis import get_dashboard_summary, get_trends_and_analytics, compute_row_aqi, categorize_aqi, POLLUTANTS
from services.model_training import train_and_evaluate_models, get_training_status
from services.prediction import predict_pm25
from services.anomaly_detection import detect_anomalies
from services.recommendation_engine import generate_recommendations
from services.report_generator import create_pdf_report

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
CORS(app)

# Global in-memory application state
APP_STATE = {
    'active_dataset_path': None,
    'active_dataset_name': "None",
    'dataset_type': "None",
    'cleaned_dataset_path': None,
    'current_df': None
}

def load_default_dataset():
    """Initializes with authentic Chennai CPCB dataset if available, or demo dataset."""
    chennai_path = os.path.join(config.DATA_DIR, 'cpcb_chennai_authentic.csv')
    demo_path = os.path.join(config.DATA_DIR, 'demo_air_quality_labeled_synthetic.csv')
    
    target_path = chennai_path if os.path.exists(chennai_path) else demo_path
    if os.path.exists(target_path):
        APP_STATE['active_dataset_path'] = target_path
        APP_STATE['active_dataset_name'] = os.path.basename(target_path)
        APP_STATE['dataset_type'] = "AUTHENTIC_CPCB_CHENNAI" if "chennai" in target_path else "SYNTHETIC_DEMO"
        
        # Auto-clean active dataset into cleaned_dataset_path
        cleaned_path = os.path.join(config.DATA_DIR, 'cleaned_' + os.path.basename(target_path))
        clean_dataset(target_path, cleaned_path)
        APP_STATE['cleaned_dataset_path'] = cleaned_path
        APP_STATE['current_df'] = pd.read_csv(cleaned_path)
        print(f"Default dataset initialized: {APP_STATE['active_dataset_name']} ({len(APP_STATE['current_df'])} records)")

# Initialize default dataset on startup
try:
    load_default_dataset()
except Exception as e:
    print(f"Startup default dataset load note: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    ml_status = get_training_status()
    return jsonify({
        'status': 'healthy',
        'service': 'EcoVision AI Backend',
        'version': '1.0.0',
        'timestamp': datetime.datetime.now().isoformat(),
        'active_dataset': {
            'name': APP_STATE['active_dataset_name'],
            'type': APP_STATE['dataset_type'],
            'record_count': len(APP_STATE['current_df']) if APP_STATE['current_df'] is not None else 0
        },
        'ml_models_ready': ml_status.get('trained', False)
    })

@app.route('/api/datasets/available', methods=['GET'])
def list_available_datasets():
    """Lists authentic public datasets and synthetic demonstration datasets."""
    datasets = []
    if os.path.exists(config.DATA_DIR):
        for f in os.listdir(config.DATA_DIR):
            if f.endswith('.csv') and not f.startswith('cleaned_') and not f.startswith('anomalies_'):
                full_p = os.path.join(config.DATA_DIR, f)
                size_kb = round(os.path.getsize(full_p) / 1024, 1)
                is_demo = "demo" in f.lower() or "synthetic" in f.lower()
                datasets.append({
                    'filename': f,
                    'display_name': "Demo Synthetic Test Dataset (120 rows)" if is_demo else f.replace('_', ' ').replace('.csv', '').title(),
                    'is_synthetic': is_demo,
                    'size_kb': size_kb,
                    'is_active': (f == APP_STATE['active_dataset_name'])
                })
    return jsonify({'datasets': datasets})

@app.route('/api/datasets/load', methods=['POST'])
def load_dataset():
    data = request.get_json() or {}
    filename = data.get('filename')
    if not filename:
        return jsonify({'error': "Filename is required."}), 400
        
    safe_name = sanitize_filename(filename)
    target_path = os.path.join(config.DATA_DIR, safe_name)
    if not os.path.exists(target_path):
        target_path = os.path.join(config.UPLOADS_DIR, safe_name)
        
    if not os.path.exists(target_path):
        return jsonify({'error': f"Dataset file '{safe_name}' not found."}), 404
        
    is_demo = "demo" in safe_name.lower() or "synthetic" in safe_name.lower()
    APP_STATE['active_dataset_path'] = target_path
    APP_STATE['active_dataset_name'] = safe_name
    APP_STATE['dataset_type'] = "SYNTHETIC_DEMO_DATA_FOR_TESTING" if is_demo else "AUTHENTIC_CPCB_DATA"
    
    # Auto-clean to ensure ready dataframe
    cleaned_path = os.path.join(config.UPLOADS_DIR, f"cleaned_{safe_name}")
    clean_meta = clean_dataset(target_path, cleaned_path)
    APP_STATE['cleaned_dataset_path'] = cleaned_path
    APP_STATE['current_df'] = pd.read_csv(cleaned_path)
    
    return jsonify({
        'message': f"Dataset '{safe_name}' successfully loaded and verified.",
        'active_dataset_name': safe_name,
        'dataset_type': APP_STATE['dataset_type'],
        'clean_metrics': clean_meta
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': "No file field present in request."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': "No file selected."}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': "Invalid file format. Please upload a standard CSV (.csv) file."}), 400
        
    filename = sanitize_filename(file.filename)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_filename = f"{timestamp}_{filename}"
    save_path = os.path.join(config.UPLOADS_DIR, saved_filename)
    file.save(save_path)
    
    # Analyze raw dataset
    try:
        raw_analysis = analyze_raw_dataset(save_path)
        is_demo = "demo" in filename.lower() or "synthetic" in filename.lower()
        
        APP_STATE['active_dataset_path'] = save_path
        APP_STATE['active_dataset_name'] = saved_filename
        APP_STATE['dataset_type'] = "SYNTHETIC_DEMO_DATA_FOR_TESTING" if is_demo else "USER_UPLOADED_DATASET"
        
        # Load uncleaned or preliminary dataframe
        APP_STATE['current_df'] = pd.read_csv(save_path)
        
        return jsonify({
            'message': f"CSV file '{filename}' successfully uploaded and inspected.",
            'filename': saved_filename,
            'dataset_type': APP_STATE['dataset_type'],
            'analysis': raw_analysis
        })
    except Exception as e:
        return jsonify({'error': f"Error analyzing uploaded CSV: {str(e)}"}), 500

@app.route('/api/clean', methods=['POST'])
def trigger_clean():
    if not APP_STATE['active_dataset_path'] or not os.path.exists(APP_STATE['active_dataset_path']):
        return jsonify({'error': "No active dataset loaded to clean."}), 400
        
    out_name = f"cleaned_{APP_STATE['active_dataset_name']}"
    out_path = os.path.join(config.UPLOADS_DIR, out_name)
    
    try:
        clean_result = clean_dataset(APP_STATE['active_dataset_path'], out_path)
        APP_STATE['cleaned_dataset_path'] = out_path
        APP_STATE['current_df'] = pd.read_csv(out_path)
        
        return jsonify({
            'message': "Dataset cleaning and imputation pipeline successfully completed.",
            'cleaned_filename': out_name,
            'metrics': clean_result
        })
    except Exception as e:
        return jsonify({'error': f"Error during data cleaning pipeline: {str(e)}"}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No dataset available."}), 400
        
    try:
        summary = get_dashboard_summary(APP_STATE['current_df'])
        summary['active_dataset'] = {
            'name': APP_STATE['active_dataset_name'],
            'type': APP_STATE['dataset_type']
        }
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': f"Failed to compute dashboard metrics: {str(e)}"}), 500

@app.route('/api/trends', methods=['GET'])
def get_trends():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No dataset available."}), 400
        
    city = request.args.get('city')
    station = request.args.get('station')
    pollutant = request.args.get('pollutant', 'PM2.5')
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    
    try:
        trends = get_trends_and_analytics(
            APP_STATE['current_df'],
            city=city,
            station=station,
            pollutant=pollutant,
            date_start=date_start,
            date_end=date_end
        )
        return jsonify(trends)
    except Exception as e:
        return jsonify({'error': f"Failed to compute trends and analytics: {str(e)}"}), 500

@app.route('/api/train', methods=['POST'])
def train_models():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No active dataset loaded for training."}), 400
        
    try:
        training_result = train_and_evaluate_models(APP_STATE['current_df'])
        return jsonify(training_result)
    except Exception as e:
        return jsonify({'error': f"Model training failed: {str(e)}"}), 500

@app.route('/api/model/status', methods=['GET'])
def model_status():
    status = get_training_status()
    return jsonify(status)

@app.route('/api/predict', methods=['POST'])
def run_prediction():
    data = request.get_json() or {}
    try:
        res = predict_pm25(data)
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': f"Prediction error: {str(e)}"}), 400

@app.route('/api/anomalies', methods=['POST'])
def run_anomalies():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No active dataset loaded for anomaly detection."}), 400
        
    data = request.get_json() or {}
    contamination = float(data.get('contamination', 0.05))
    city = data.get('city')
    station = data.get('station')
    
    try:
        res = detect_anomalies(APP_STATE['current_df'], contamination=contamination, city=city, station=station)
        
        # Save anomaly results to CSV for export
        if res.get('anomalies'):
            anom_df = pd.DataFrame(res['anomalies'])
            anom_csv_path = os.path.join(config.DATA_DIR, 'anomalies_latest.csv')
            anom_df.to_csv(anom_csv_path, index=False)
            
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': f"Anomaly detection failed: {str(e)}"}), 500

@app.route('/api/risk', methods=['GET'])
def get_risk_assessment():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No active dataset loaded."}), 400
        
    try:
        summary = get_dashboard_summary(APP_STATE['current_df'])
        return jsonify({
            'averages': summary['averages'],
            'risk_distribution': summary['risk_distribution'],
            'cpcb_breakpoints': config.CPCB_AQI_BREAKPOINTS,
            'aqi_categories': config.AQI_CATEGORIES,
            'naaqs_standards': config.CPCB_NAAQS_24HR
        })
    except Exception as e:
        return jsonify({'error': f"Risk assessment computation failed: {str(e)}"}), 500

@app.route('/api/recommendations', methods=['GET'])
def get_recs():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No active dataset loaded."}), 400
        
    try:
        recs = generate_recommendations(APP_STATE['current_df'])
        return jsonify({'recommendations': recs})
    except Exception as e:
        return jsonify({'error': f"Recommendation generation failed: {str(e)}"}), 500

@app.route('/api/report', methods=['POST'])
def generate_report():
    if APP_STATE['current_df'] is None or len(APP_STATE['current_df']) == 0:
        return jsonify({'error': "No active dataset available to generate report."}), 400
        
    try:
        report_path, filename = create_pdf_report(APP_STATE['current_df'])
        return jsonify({
            'message': "Comprehensive environmental analytical report generated successfully.",
            'filename': filename,
            'download_url': f"/api/download/report/{filename}"
        })
    except Exception as e:
        return jsonify({'error': f"Failed to generate PDF report: {str(e)}"}), 500

@app.route('/api/download/report/<filename>', methods=['GET'])
def download_report(filename):
    safe_name = sanitize_filename(filename)
    file_path = os.path.join(config.REPORTS_DIR, safe_name)
    if not os.path.exists(file_path):
        return jsonify({'error': "Report file not found."}), 404
    return send_file(file_path, as_attachment=True, download_name=safe_name, mimetype='application/pdf')

@app.route('/api/download/csv/<file_type>', methods=['GET'])
def download_csv(file_type):
    if file_type == 'cleaned':
        target = APP_STATE.get('cleaned_dataset_path')
        if not target or not os.path.exists(target):
            # Fallback to current df
            if APP_STATE['current_df'] is not None:
                target = os.path.join(config.DATA_DIR, 'cleaned_dataset_export.csv')
                APP_STATE['current_df'].to_csv(target, index=False)
            else:
                return jsonify({'error': "Cleaned dataset not available."}), 404
        return send_file(target, as_attachment=True, download_name="ecovision_cleaned_dataset.csv", mimetype='text/csv')
        
    elif file_type == 'anomalies':
        target = os.path.join(config.DATA_DIR, 'anomalies_latest.csv')
        if not os.path.exists(target):
            # Generate from current dataset
            if APP_STATE['current_df'] is not None:
                res = detect_anomalies(APP_STATE['current_df'], contamination=0.05)
                anom_df = pd.DataFrame(res.get('anomalies', []))
                anom_df.to_csv(target, index=False)
            else:
                return jsonify({'error': "Anomaly dataset not available."}), 404
        return send_file(target, as_attachment=True, download_name="ecovision_detected_anomalies.csv", mimetype='text/csv')

    elif file_type == 'predictions':
        # Generate sample predictions CSV
        if APP_STATE['current_df'] is not None:
            pred_path = os.path.join(config.DATA_DIR, 'predictions_export.csv')
            train_status = get_training_status()
            if not train_status.get('trained'):
                train_and_evaluate_models(APP_STATE['current_df'])
            # Generate predictions on sample
            sample = APP_STATE['current_df'].head(50).copy()
            pred_records = []
            for _, r in sample.iterrows():
                try:
                    p_res = predict_pm25(r.to_dict())
                    pred_records.append({
                        'Date': r.get('Date', 'N/A'),
                        'City': r.get('City', 'N/A'),
                        'Actual_PM2.5': r.get('PM2.5', None),
                        'Predicted_PM2.5': p_res['predicted_pm25'],
                        'AQI_SubIndex': p_res['sub_index'],
                        'Risk_Category': p_res['risk_category']
                    })
                except Exception:
                    pass
            pd.DataFrame(pred_records).to_csv(pred_path, index=False)
            return send_file(pred_path, as_attachment=True, download_name="ecovision_predictions_export.csv", mimetype='text/csv')
            
    return jsonify({'error': "Invalid export file type requested."}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
