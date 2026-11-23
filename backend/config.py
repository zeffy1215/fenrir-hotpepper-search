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
    HOTPEPPER_GOURMET_SEARCH_API_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/"
    HOTPEPPER_LARGE_MASTER_API_URL = "https://webservice.recruit.co.jp/hotpepper/large_area/v1/"
    HOTPEPPER_MIDDLE_MASTER_API_URL = "https://webservice.recruit.co.jp/hotpepper/middle_area/v1/"
    HOTPEPPER_SMALL_MASTER_API_URL = "https://webservice.recruit.co.jp/hotpepper/small_area/v1/"
    HOTPEPPER_GENRE_MASTER_API_URL = "https://webservice.recruit.co.jp/hotpepper/genre/v1/"
    
    # HotPepperのAPIキー
    API_KEY = os.getenv('API_KEY')

    # HotPepperのAPIのリクエストタイムアウト時間
    HOTPEPPER_CONNECT_TIMEOUT = 3.5
    HOTPEPPER_READ_TIMEOUT = 7.5

    # ビルドしたフロントエンド(../frontend/dist)のフォルダパス
    FRONTEND_DIST = os.path.join(current_dir.parent, "frontend", "dist")