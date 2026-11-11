import requests
from config import Config

def search(lat:float, lng:float, search_range:int):
    params = {
        "key": Config.API_KEY,
        "lat": lat,
        "lng": lng,
        "range": search_range,
        "format": "json"
    }
    response = requests.get(
        url=Config.HOTPEPPER_API_URL,
        params=params,
        timeout=(Config.HOTPEPPER_CONNECT_TIMEOUT, Config.HOTPEPPER_READ_TIMEOUT)
    )
    return response.json()