import re
import requests
from requests.exceptions import Timeout
from exceptions.hotpepper_exception import (HotpepperTimeoutError, HotpepperGatewayError ,
    HotpepperApiKeyError, HotpepperBadRequestError, HotpepperNotFoundError, HotpepperMultipleResultsError, HotpepperError)
from dataclasses import asdict
from dto.shop_search_params import ShopSearchByLocationParamsDto
from dto.shop_search_response import ShopPhoto, ShopOpen, ShopInfo, ShopListResponse, ShopDetailResponse
from config import Config

# codeが取りうる範囲(ホットペッパーのreference.htmlの13を参照)
HOTPEPPER_ERROR_SERVER = 1000      # サーバー障害エラー
HOTPEPPER_ERROR_AUTH = 2000        # APIキーまたはIPアドレスの認証エラー
HOTPEPPER_ERROR_PARAMETER = 3000   # パラメータ不正エラー

# 曜日：
def format_open(text):
    if not text:
        return None
    
    matches = re.findall(r"([月火水木金土日祝前、～]+):([^月火水木金土日祝前、]+)", text)
    if matches:
        return [ShopOpen(days=day, hours=hour) for (day, hour) in matches]
    return text

def to_shop_photo(shop: dict) -> ShopPhoto:
    photo = shop.get("photo", {}).get("pc", {})
    return ShopPhoto(
        large=photo.get("l"),
        medium=photo.get("m"),
        small=photo.get("s")
    )

def shop_info_fields(shop: dict) -> dict:
    return {
        "id": shop["id"],
        "name": shop["name"],
        "name_kana": shop.get("name_kana"),

        "address": shop["address"],
        "access": shop["access"],

        "genre_name": shop.get("genre", {}).get("name"),
        "sub_genre": shop.get("sub_genre", {}).get("name"),

        "catch": shop["catch"],
        "open": format_open((shop.get("open"))),
        "close": shop.get("close"),

        "photo": to_shop_photo(shop)
    }

# type=liteを指定したときに取得されないものと入れ子のものは、getで取得
def to_shop_info(shop: dict) -> ShopInfo:
    return ShopInfo(**shop_info_fields(shop))


def to_shop_detail(shop: dict) -> ShopDetailResponse:
    return ShopDetailResponse(
        **shop_info_fields(shop),
        area=shop.get("middle_area", {}).get("name")
    )


def request_hotpepper(params: dict) -> dict:
    params = {k: v for k, v in params.items() if v is not None}
    params["key"] = Config.API_KEY
    params["format"] = "json"

    try:
        response = requests.get(
            url=Config.HOTPEPPER_API_URL,
            params=params,
            timeout=(Config.HOTPEPPER_CONNECT_TIMEOUT, Config.HOTPEPPER_READ_TIMEOUT)
        )
    except Timeout as e:
        raise HotpepperTimeoutError("ホットペッパーAPIへのリクエストがタイムアウトしました") from e

    data = response.json()
    results = data["results"]

    if 'error' in data["results"]:
        errors = data["results"]["error"]
        error = errors[0]

        code = int(error["code"])

        if code == HOTPEPPER_ERROR_SERVER:
            raise HotpepperGatewayError("ホットペッパーサーバーに障害が発生しました(code=1000)")
        elif code == HOTPEPPER_ERROR_AUTH: 
            raise HotpepperApiKeyError("APIキーが正しくありません(code=2000)")
        elif code == HOTPEPPER_ERROR_PARAMETER:
            raise HotpepperBadRequestError("パラメーターが正しくありません(API_KEYなどの必須パラメータが不足している可能性があります) (code=3000)")
        else:
            raise HotpepperError(f"ホットペッパーAPI呼び出し中に不明なエラーが発生しました (code={str(code)})")

    return results

def search(params: ShopSearchByLocationParamsDto) -> ShopListResponse:
    results = request_hotpepper(asdict(params))
    shop_list = results["shop"]

    shops = [to_shop_info(shop) for shop in shop_list]
    
    response = ShopListResponse(
        available=results["results_available"],
        count=int(results["results_returned"]),
        start=results["results_start"],
        shops=shops
    )
            
    return response

def get_detail(params: dict) -> ShopDetailResponse:
    results = request_hotpepper(params)

    try:
        if int(results["results_returned"]) == 0:
            raise HotpepperNotFoundError("店舗情報が見つかりません")
        elif int(results["results_returned"]) >= 2:
            raise HotpepperMultipleResultsError("店舗情報が2件以上見つかりました。")

        shop = results["shop"][0]
    except (KeyError, ValueError) as e:
        raise HotpepperError("ホットペッパーAPI呼び出し中に不明なエラーが発生しました") from e

    return to_shop_detail(shop)
    