from dataclasses import dataclass
from .validators import validate_number

"""
位置情報と検索範囲による検索の際に使用
グルメサーチAPIを叩く際のクエリパラメータ用のDTO
クラスを作ったタイミングでバリテーションを行う
  エラー時：ValidationErrorを返す
NoneはServiceで弾く
変数名はグルメサーチAPIのパラメータ名に揃える
"""
@dataclass
class ShopSearchByLocationParamsDto:
    # 必須パラメータ
    lat: float | None = None                # 緯度(-90°~90°)
    lng: float | None = None                # 経度(-180°~180°)
    range: int | None = None                # 検索範囲(1,2,3,4,5)

    start: int = 1                          # 検索の開始位置(1~)
    count: int = 10                         # １ページの掲載件数(1~100)

    order: int = 4                          # ソート順(1,2,3,4)

    # 任意パラメータ
    free_drink: int | None = None           # 飲み放題(0,1)
    free_food: int | None = None            # 食べ放題(0,1)
    card: int | None = None                 # カード決済(0,1)
    parking: int | None = None              # 駐車場(0,1)
    lunch: int | None = None                # ランチあり(0,1)
    midnight: int | None = None             # 23時以降の営業(0,1)

    def __post_init__(self):
        self.lat = validate_number(self.lat, name="緯度", converter=float, min_value=-90.0, max_value=90.0)
        self.lng = validate_number(self.lng, name="経度", converter=float, min_value=-180.0, max_value=180.0)
        self.range = validate_number(self.range, name="検索範囲", converter=int, min_value=1, max_value=5)

        self.start = validate_number(self.start, name="検索の開始位置", converter=int, min_value=1)
        self.count = validate_number(self.count, name="1ページあたりの取得数", converter=int, min_value=1, max_value=100)

        self.order = validate_number(self.order, name="ソート順", converter=int, min_value=1, max_value=4)

        self.free_drink = validate_number(self.free_drink, name="飲み放題", converter=int, min_value=0, max_value=1, required=False)
        self.free_food = validate_number(self.free_food, name="食べ放題", converter=int, min_value=0, max_value=1, required=False)
        self.card = validate_number(self.card, name="カード決済", converter=int, min_value=0, max_value=1, required=False)
        self.parking = validate_number(self.parking, name="駐車場", converter=int, min_value=0, max_value=1, required=False)
        self.lunch = validate_number(self.lunch, name="ランチあり", converter=int, min_value=0, max_value=1, required=False)
        self.midnight = validate_number(self.midnight, name="23時以降の営業", converter=int, min_value=0, max_value=1, required=False)
    