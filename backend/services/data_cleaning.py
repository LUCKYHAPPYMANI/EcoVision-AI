import os
import pandas as pd
import numpy as np
from utils.validators import map_column_name

POLLUTANT_COLS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'NH3']

def analyze_raw_dataset(file_path):
    """
    Analyzes raw uploaded CSV without modifying it.
    Returns preview, column mappings, data types, missing counts, duplicates, negative counts.
    """
    df_raw = pd.read_csv(file_path)
    original_cols = df_raw.columns.tolist()
    mapped_cols = {col: map_column_name(col) for col in original_cols}
    
    # Rename temporarily to inspect
    df = df_raw.rename(columns=mapped_cols)
    total_records = len(df)
    
    # Missing values
    missing_stats = {}
    for col in df.columns:
        n_missing = int(df[col].isna().sum())
        missing_stats[col] = {
            'count': n_missing,
            'percentage': round((n_missing / total_records * 100) if total_records > 0 else 0, 2)
        }
        
    # Duplicates
    duplicate_count = int(df.duplicated().sum())
    
    # Negative values in numerical pollutant columns
    negative_stats = {}
    for p in POLLUTANT_COLS:
        if p in df.columns:
            # Try to convert to numeric to test
            num_series = pd.to_numeric(df[p], errors='coerce')
            neg_count = int((num_series < 0).sum())
            if neg_count > 0:
                negative_stats[p] = neg_count
                
    # Detect detected pollutants
    available_pollutants = [p for p in POLLUTANT_COLS if p in df.columns]
    
    # Data preview (first 10 records as dict)
    preview = df_raw.head(10).replace({np.nan: None}).to_dict(orient='records')
    
    return {
        'total_records': total_records,
        'original_columns': original_cols,
        'mapped_columns': mapped_cols,
        'available_pollutants': available_pollutants,
        'missing_stats': missing_stats,
        'duplicate_count': duplicate_count,
        'negative_stats': negative_stats,
        'preview': preview
    }

def clean_dataset(file_path, output_path=None):
    """
    Performs full robust data cleaning:
    1. Standardizes column names
    2. Parses dates
    3. Coerces pollutant columns to numeric
    4. Handles invalid negative values (turns to NaN)
    5. Deduplicates
    6. Imputes missing values responsibly (forward-fill/median)
    7. Saves cleaned CSV and returns audit metrics
    """
    df_raw = pd.read_csv(file_path)
    initial_count = len(df_raw)
    
    # 1. Map columns
    mapped_cols = {col: map_column_name(col) for col in df_raw.columns}
    df = df_raw.rename(columns=mapped_cols)
    
    operations_log = []
    
    # 2. Date parsing
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        invalid_dates = df['Date'].isna().sum()
        if invalid_dates > 0:
            operations_log.append(f"Parsed 'Date' column. {invalid_dates} unparseable date rows filled with sequential fallback.")
            df['Date'] = df['Date'].ffill().bfill()
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        operations_log.append("Standardized date column into ISO 8601 (YYYY-MM-DD).")
    elif 'date' in df.columns:
        df['Date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')
        operations_log.append("Created standardized 'Date' column.")
    else:
        # Generate dummy sequential dates if none present
        df['Date'] = pd.date_range(start='2024-01-01', periods=len(df), freq='D').strftime('%Y-%m-%d')
        operations_log.append("No explicit Date column detected. Generated sequential dates for time-series modeling.")

    # 3. Deduplicate
    duplicates_removed = int(df.duplicated().sum())
    if duplicates_removed > 0:
        df = df.drop_duplicates()
        operations_log.append(f"Removed {duplicates_removed} exact duplicate observations.")
    else:
        operations_log.append("No duplicate observations detected.")
        
    # Ensure City and Station exist
    if 'City' not in df.columns:
        df['City'] = 'Default City'
        operations_log.append("Standardized missing City column to 'Default City'.")
    else:
        df['City'] = df['City'].fillna('Unknown City').astype(str)

    if 'Station' not in df.columns:
        df['Station'] = df['City'] + '-Monitoring Station'
        operations_log.append("Standardized missing Station column to composite Station name.")
    else:
        df['Station'] = df['Station'].fillna(df['City'] + '-Station').astype(str)

    # 4. Numeric conversion & negative value handling for pollutants
    negative_corrected = 0
    pollutants_present = [p for p in POLLUTANT_COLS if p in df.columns]
    
    for p in pollutants_present:
        df[p] = pd.to_numeric(df[p], errors='coerce')
        negs = (df[p] < 0).sum()
        if negs > 0:
            negative_corrected += int(negs)
            df.loc[df[p] < 0, p] = np.nan
            operations_log.append(f"Detected {negs} negative sensor readings in {p}; converted to NaN for imputation.")
            
    # 5. Missing value imputation (preserves records without discarding rows)
    missing_imputed = 0
    for p in pollutants_present:
        missing_count = int(df[p].isna().sum())
        if missing_count > 0:
            missing_imputed += missing_count
            # Grouped median by City if feasible, else global median
            city_medians = df.groupby('City')[p].transform('median')
            df[p] = df[p].fillna(city_medians)
            global_median = df[p].median()
            if pd.isna(global_median):
                global_median = 0.0
            df[p] = df[p].fillna(round(global_median, 2))
            operations_log.append(f"Imputed {missing_count} missing values in {p} using city/global median.")

    # Round pollutant numbers cleanly
    for p in pollutants_present:
        df[p] = df[p].round(2)
        
    final_count = len(df)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        
    return {
        'initial_record_count': initial_count,
        'final_record_count': final_count,
        'duplicates_removed': duplicates_removed,
        'negatives_corrected': negative_corrected,
        'missing_values_imputed': missing_imputed,
        'operations_log': operations_log,
        'columns': df.columns.tolist(),
        'available_pollutants': pollutants_present,
        'cleaned_preview': df.head(10).replace({np.nan: None}).to_dict(orient='records')
    }
