import os
import re
from werkzeug.utils import secure_filename
from config import ALLOWED_EXTENSIONS, COLUMN_MAPPINGS

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_filename(filename):
    clean = secure_filename(filename)
    if not clean:
        clean = "uploaded_dataset.csv"
    return clean

def map_column_name(col):
    col_str = str(col).strip()
    col_lower = re.sub(r'[\s\-_]+', '', col_str.lower())
    for alias, standard in COLUMN_MAPPINGS.items():
        alias_clean = re.sub(r'[\s\-_]+', '', alias.lower())
        if col_lower == alias_clean:
            return standard
    return col_str
