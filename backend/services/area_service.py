from dataclasses import asdict
from dto.area_mastar_response import Area, AreaMasterResponse
from .hotpepper_service import request_large_area_master, request_middle_area_master

# 都道府県の並び順（参考:https://www.asahi-net.or.jp/~ax2s-kmtn/ref/jisx0401.html）
# ホットペッパーの large_area の name に合わせて、「都」「府」「県」を付けない
PREFECTURE_ORDER = [
    "北海道",
    "青森", "岩手", "宮城", "秋田", "山形", "福島",
    "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
    "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知",
    "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
    "鳥取", "島根", "岡山", "広島", "山口",
    "徳島", "香川", "愛媛", "高知",
    "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
]

def prefecture_priority(area) -> int:
    try:
        return PREFECTURE_ORDER.index(area)
    except ValueError:
        return 50

def get_large_area_master() -> AreaMasterResponse:
    results = request_large_area_master()
    areas = [Area(value=area["code"], label=area["name"]) for area in results["large_area"]]
    areas.sort(key=lambda area: prefecture_priority(area.label))
    return AreaMasterResponse(areas=areas)

def get_middle_area_master(params: dict) -> AreaMasterResponse:
    results = request_middle_area_master(params)
    areas = [Area(value=area["code"], label=area["name"]) for area in results["middle_area"]]
    return AreaMasterResponse(areas=areas)

def get_small_area_master(params: dict) -> AreaMasterResponse:
    results = request_middle_area_master(params)
    areas = [Area(value=area["code"], label=area["name"]) for area in results["small_area"]]
    return AreaMasterResponse(areas=areas)
