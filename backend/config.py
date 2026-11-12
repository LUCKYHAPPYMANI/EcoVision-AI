import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {'csv'}

# Standard pollutant column aliases for resilient column mapping
COLUMN_MAPPINGS = {
    'pm2.5': 'PM2.5',
    'pm25': 'PM2.5',
    'pm2_5': 'PM2.5',
    'pm_25': 'PM2.5',
    'pm10': 'PM10',
    'pm_10': 'PM10',
    'no2': 'NO2',
    'no_2': 'NO2',
    'so2': 'SO2',
    'so_2': 'SO2',
    'co': 'CO',
    'o3': 'O3',
    'ozone': 'O3',
    'nh3': 'NH3',
    'date': 'Date',
    'datetime': 'Date',
    'timestamp': 'Date',
    'time': 'Date',
    'city': 'City',
    'station': 'Station',
    'station_name': 'Station',
    'location': 'Station'
}

# CPCB National Ambient Air Quality Standards (NAAQS) 24-hr benchmarks (µg/m³, CO in mg/m³)
CPCB_NAAQS_24HR = {
    'PM2.5': 60.0,
    'PM10': 100.0,
    'NO2': 80.0,
    'SO2': 80.0,
    'CO': 2.0,   # mg/m³
    'O3': 100.0  # 8-hr standard
}

# CPCB Air Quality Index (AQI) Breakpoint Table
# Format: (C_low, C_high, I_low, I_high)
CPCB_AQI_BREAKPOINTS = {
    'PM2.5': [
        (0, 30, 0, 50),
        (30.1, 60, 51, 100),
        (60.1, 90, 101, 200),
        (90.1, 120, 201, 300),
        (120.1, 250, 301, 400),
        (250.1, 500, 401, 500)
    ],
    'PM10': [
        (0, 50, 0, 50),
        (50.1, 100, 51, 100),
        (100.1, 250, 101, 200),
        (250.1, 350, 201, 300),
        (350.1, 430, 301, 400),
        (430.1, 600, 401, 500)
    ],
    'NO2': [
        (0, 40, 0, 50),
        (40.1, 80, 51, 100),
        (80.1, 180, 101, 200),
        (180.1, 280, 201, 300),
        (280.1, 400, 301, 400),
        (400.1, 600, 401, 500)
    ],
    'SO2': [
        (0, 40, 0, 50),
        (40.1, 80, 51, 100),
        (80.1, 380, 101, 200),
        (380.1, 800, 201, 300),
        (800.1, 1600, 301, 400),
        (1600.1, 2000, 401, 500)
    ],
    'CO': [
        (0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500)
    ],
    'O3': [
        (0, 50, 0, 50),
        (50.1, 100, 51, 100),
        (100.1, 168, 101, 200),
        (168.1, 208, 201, 300),
        (208.1, 748, 301, 400),
        (748.1, 1000, 401, 500)
    ]
}

AQI_CATEGORIES = [
    (0, 50, 'Good', '#10B981', 'Minimal health impact; air quality is satisfactory.'),
    (51, 100, 'Satisfactory', '#34D399', 'Minor breathing discomfort to sensitive people.'),
    (101, 200, 'Moderate', '#FBBF24', 'Breathing discomfort to people with lungs, asthma and heart diseases.'),
    (201, 300, 'Poor', '#F97316', 'Breathing discomfort to most people on prolonged exposure.'),
    (301, 400, 'Very Poor', '#EF4444', 'Respiratory illness on prolonged exposure.'),
    (401, 1000, 'Severe', '#7F1D1D', 'Affects healthy people and seriously impacts those with existing diseases.')
]
