import os
from pathlib import Path
from dotenv import load_dotenv

current_dir = Path(__file__).resolve().parent
load_dotenv(os.path.join(current_dir, '.env'))

class Config:
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', '8080'))
    DEBUG = os.getenv('DEBUG', 'False') == 'True'

    # HotPepperのAPIのURL
    HOTPEPPER_API_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/"
    
    # HotPepperのAPIキー
    API_KEY = os.getenv('API_KEY')

    # HotPepperのAPIのリクエストタイムアウト時間
    HOTPEPPER_CONNECT_TIMEOUT = 3.5
    HOTPEPPER_READ_TIMEOUT = 7.5