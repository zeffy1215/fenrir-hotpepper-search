import requests
from requests.exceptions import Timeout
from backend.exceptions.hotpepper_exception import HotpepperTimeoutError, HotpepperGatewayError ,HotpepperApiKeyError, HotpepperBadRequestError, HotpepperError
from config import Config

# codeが取りうる範囲(ホットペッパーのreference.htmlの13を参照)
HOTPEPPER_ERROR_SERVER = 1000      # サーバー障害エラー
HOTPEPPER_ERROR_AUTH = 2000        # APIキーまたはIPアドレスの認証エラー
HOTPEPPER_ERROR_PARAMETER = 3000   # パラメータ不正エラー

def search(lat:float, lng:float, search_range:int):
    params = {
        "key": Config.API_KEY,
        "lat": lat,
        "lng": lng,
        "range": search_range,
        "format": "json"
    }
    try:
        response = requests.get(
            url=Config.HOTPEPPER_API_URL,
            params=params,
            timeout=(Config.HOTPEPPER_CONNECT_TIMEOUT, Config.HOTPEPPER_READ_TIMEOUT)
        )
    except Timeout as e:
        raise HotpepperTimeoutError("ホットペッパーAPIへのリクエストがタイムアウトしました") from e

    data = response.json()

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
            
    return data