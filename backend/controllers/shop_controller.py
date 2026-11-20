from flask import Blueprint, request, jsonify
from exceptions.hotpepper_exception import (HotpepperTimeoutError, HotpepperNotFoundError, HotpepperError)

from exceptions.validation_exception import ValidationError
from services import shop_service
from dto.shop_search_params import ShopSearchByLocationParamsDto

shop_bp = Blueprint('shop_bp', __name__)

@shop_bp.route('/search')
def search():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    search_range = request.args.get("range")

    middle_area = request.args.get("area")

    start = request.args.get("start")
    count = request.args.get("count")
    order = request.args.get("order")

    genre = request.args.get("genre")
    free_drink = request.args.get("free_drink")
    free_food = request.args.get("free_food")
    card = request.args.get("card")
    parking = request.args.get("parking")
    lunch = request.args.get("lunch")
    midnight = request.args.get("midnight")

    args = {
        "lat": lat,
        "lng": lng,
        "range": search_range,

        "middle_area": middle_area,

        "start": start,
        "count": count,
        "order": order,

        "genre": genre,
        "free_drink": free_drink,
        "free_food": free_food,
        "card": card,
        "parking": parking,
        "lunch": lunch,
        "midnight": midnight,
    }

    args = {k: v for k, v in args.items() if v}
    
    # バリデーション
    try:
        params = ShopSearchByLocationParamsDto(**args)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400 # BadRequest

    try:
        res = shop_service.search(params)
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200

@shop_bp.route('/<id>')
def get_shop_by_id(id):
    params = {
        "id": id
    }

    try:
        res = shop_service.get_detail(params)
    except HotpepperTimeoutError as e: 
        return jsonify({"error": str(e)}), 504 # Gateway Timeout
    except HotpepperNotFoundError as e:
        return jsonify({"error": str(e)}), 404 # NotFound
    except HotpepperError as e:
        print(str(e)) # TODO: print→ログファイル::残す際は開発者にわかりやすいよう
        return jsonify({"error": "サーバーエラーが発生しました"}), 502 # Bad Gateway
    
    return jsonify(res), 200
