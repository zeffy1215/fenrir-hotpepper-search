import os
from pathlib import Path
from dotenv import load_dotenv

current_dir = Path(__file__).resolve().parent
load_dotenv(os.path.join(current_dir, '.env'))

class Config:
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', '8080'))
    DEBUG = os.getenv('DEBUG', 'False') == 'True'

    API_KEY = os.getenv('API_KEY')