from flask import Blueprint, jsonify
from exceptions.hotpepper_exception import (HotpepperTimeoutError, HotpepperError)
from services import genre_service

genre_bp = Blueprint('genre_bp', __name__)

@genre_bp.route("/")
def get_learge_genre_master():
    try:
        res = genre_service.get_genre_master()
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200
