import re
import requests
from requests.exceptions import Timeout
from exceptions.hotpepper_exception import HotpepperTimeoutError, HotpepperGatewayError ,HotpepperApiKeyError, HotpepperBadRequestError, HotpepperError
from dataclasses import asdict
from dto.shop_search_params import ShopSearchByLocationParamsDto
from dto.shop_search_response import ShopPhoto, ShopOpen, ShopInfo, ShopListResponse
from config import Config

# codeが取りうる範囲(ホットペッパーのreference.htmlの13を参照)
HOTPEPPER_ERROR_SERVER = 1000      # サーバー障害エラー
HOTPEPPER_ERROR_AUTH = 2000        # APIキーまたはIPアドレスの認証エラー
HOTPEPPER_ERROR_PARAMETER = 3000   # パラメータ不正エラー

# 曜日：
def format_open(text):
    matches = re.findall(r"([月火水木金土日祝前、～]+):([^月火水木金土日祝前、]+)", text)
    if matches:
        return [ShopOpen(days=day, hours=hour) for (day, hour) in matches]
    return text

# type=liteを指定したときに取得されないものと入れ子のものは、getで取得
def to_shop_info(shop: dict) -> ShopInfo:
    return ShopInfo(
        id=shop["id"],
        name=shop["name"],
        name_kana=shop.get("name_kana"),

        address=shop["address"],
        access=shop["access"],

        genre_name=shop.get("genre", {}).get("name"),
        sub_genre=shop.get("sub_genre", {}).get("name"),

        catch=shop["catch"],
        open=format_open((shop.get("open"))),
        close=shop.get("close"),

        photo=ShopPhoto(
            large=shop.get("photo", {}).get("pc", {}).get("l"),
            medium=shop.get("photo", {}).get("pc", {}).get("m"),
            small=shop.get("photo", {}).get("pc", {}).get("s")
        )
    )

def search(params: ShopSearchByLocationParamsDto) -> ShopListResponse:
    params = {k: v for k, v in asdict(params).items() if v is not None}
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

    
    shop_list = results["shop"]

    shops = [to_shop_info(shop) for shop in shop_list]
    
    response = ShopListResponse(
        available=results["results_available"],
        count=int(results["results_returned"]),
        start=results["results_start"],
        shops=shops
    )
            
    return response