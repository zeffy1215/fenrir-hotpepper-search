import requests
from requests.exceptions import Timeout
from exceptions.hotpepper_exception import HotpepperTimeoutError, HotpepperGatewayError, HotpepperApiKeyError, HotpepperBadRequestError, HotpepperError
from config import Config

# codeが取りうる範囲(ホットペッパーのreference.htmlの13を参照)
HOTPEPPER_ERROR_SERVER = 1000      # サーバー障害エラー
HOTPEPPER_ERROR_AUTH = 2000        # APIキーまたはIPアドレスの認証エラー
HOTPEPPER_ERROR_PARAMETER = 3000   # パラメータ不正エラー

# ホットペッパーAPIを叩く処理（ホットペッパーのエラー時はraiseする)
def request_hotpepper(url: str, params: dict) -> dict:
    params = {k: v for k, v in params.items() if v is not None}
    params["key"] = Config.API_KEY
    params["format"] = "json"

    try:
        response = requests.get(
            url=url,
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

def request_gourmet_search(params: dict) -> dict:
    return request_hotpepper(Config.HOTPEPPER_GOURMET_SEARCH_API_URL, params)

def request_large_area_master() -> dict:
    return request_hotpepper(Config.HOTPEPPER_LARGE_MASTER_API_URL, {})

def request_middle_area_master(params: dict) -> dict:
    return request_hotpepper(Config.HOTPEPPER_MIDDLE_MASTER_API_URL, params)

def request_small_area_master(params: dict) -> dict:
    return request_hotpepper(Config.HOTPEPPER_SMALL_MASTER_API_URL, params)
