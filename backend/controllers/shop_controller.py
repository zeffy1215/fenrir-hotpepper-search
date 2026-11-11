from flask import Blueprint, request, jsonify
from exceptions.hotpepper_exception import HotpepperTimeoutError, HotpepperError
from services import shop_service

shop_bp = Blueprint('shop_bp', __name__)

def validate_value(value, min_value, max_value, converter, name):
    try:
        value = converter(value)
    except ValueError:
        raise ValueError(f"{name}に数値以外が入っています")
    except TypeError:
        raise ValueError(f"{name}のパラメーターが設定されていません")

    if not (min_value <= value <= max_value):
        raise ValueError(f"{name}の値が範囲外です")

    return value
    

@shop_bp.route('/search')
def search():
    lat = request.args.get("lat")             # 緯度(-90°~90°)
    lng = request.args.get("lng")             # 経度(-180°~180°)
    search_range = request.args.get("range")  # 検索範囲(1,2,3,4,5)

    # バリデーション
    try:
        lat = validate_value(lat, min_value=-90.0, max_value=90.0, converter=float, name="緯度")
        lng = validate_value(lng, min_value=-180.0, max_value=180.0, converter=float, name="経度")
        search_range = validate_value(search_range, min_value=1, max_value=5, converter=int, name="検索範囲")

    except ValueError as e:
        return jsonify({"error": str(e)}), 400 # BadRequest

    try:
        res = shop_service.search(lat, lng, search_range)
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200