# backend/app/utils/file_handler.py
import os
from werkzeug.utils import secure_filename
import time
import logging

logger = logging.getLogger(__name__)

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_uploaded_file(file, upload_folder):
    filename = secure_filename(file.filename)
    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    logger.info(f"Saved uploaded file: {file_path}")
    return unique_filename

def get_file_path(filename, upload_folder):
    return os.path.join(upload_folder, filename)

def cleanup_old_files(directory, max_age):
    current_time = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age:
                os.remove(file_path)
                logger.info(f"Removed old file: {file_path}")