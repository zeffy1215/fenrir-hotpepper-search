from flask import Blueprint, request, jsonify
from exceptions.hotpepper_exception import (HotpepperTimeoutError, HotpepperNotFoundError, HotpepperError)
from exceptions.validation_exception import ValidationError
from services import area_service
from dto.shop_search_params import ShopSearchByLocationParamsDto

area_bp = Blueprint('area_bp', __name__)

@area_bp.route("/large")
def get_learge_area_master():
    try:
        res = area_service.get_large_area_master()
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200

@area_bp.route("/middle/<code>")
def get_middle_area_master(code):
    params = {
        "large_area": code
    }

    try:
        res = area_service.get_middle_area_master(params)
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200

@area_bp.route("/small/<code>")
def get_small_area_master(code):
    params = {
        "middle_area": code
    }

    try:
        res = area_service.get_small_area_master(params)
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200