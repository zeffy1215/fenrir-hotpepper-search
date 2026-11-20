from dataclasses import dataclass

"""
レスポンシブ対応のためのサイズ別店舗トップ写真のURL
"""
@dataclass
class ShopPhoto:
    large: str                           # 店舗トップ写真(大) 
    medium: str                          # 店舗トップ写真(中)
    small: str                           # 店舗トップ写真(小)

"""
お店の営業時間を曜日ごとに分けたもの
"""
@dataclass
class ShopOpen:
    days: str                            # 曜日
    hours: str                           # 営業時間

"""
お店のジャンル
"""
@dataclass
class ShopGenre:
    code: str                           # ジャンルコード
    name: str                           # ジャンル名

"""
お店のエリア(ミドルエリア)
"""
@dataclass
class ShopArea:
    code: str                           # ジャンルコード
    name: str                           # エリア名

"""
検索結果の一覧に表示する、店舗1件分の情報
ホットペッパーAPIの店舗情報のうち、一覧画面で必要な項目だけを持つ。
"""
@dataclass(kw_only=True)
class ShopInfo:
    id: str                              # 店舗ID
    name: str                            # 掲載店名
    name_kana: str                       # 掲載店名(かな)
    
    address: str                         # 住所
    access: str                          # お店アクセス

    genre: list[ShopGenre]               # ジャンル

    catch: str                           # お店キャッチ

    open: list[ShopOpen] | str | None    # 営業時間
    close: str | None                    # 定休日

    photo: ShopPhoto                     # 店舗トップ写真


"""
店舗検索API（GET /api/shops/search）がフロントエンドに返すレスポンス
店舗の一覧と、ページングに必要な件数の情報を返す
"""
@dataclass
class ShopListResponse:
    available: int                       # 検索結果の全件数
    count: int                           # レスポンスに含まれる検索結果の件数
    start: int                           # 検索結果の開始位置

    shops: list[ShopInfo]                # 店舗情報

@dataclass(kw_only=True)
class ShopDetailResponse(ShopInfo):
    area: ShopArea | None                # 店舗エリア

    lat: float | None                    # 店舗緯度
    lng: float | None                    # 店舗経度

    budget: str | None                   # ディナー予算
    capacity: int | None                 # 総席数
    url: str | None                      # 店舗URL
    station: str | None                  # 最寄駅

    wedding: bool | str | None           # ウェディング･二次会
    course: bool | str | None            # コース
    free_drink: bool | str | None        # 飲み放題
    free_food: bool | str | None         # 食べ放題
    private_room: bool | str | None      # 個室
    tatami: bool | str | None            # 座敷	
    card: bool | str | None              # カード可
    non_smoking: bool | str | None       # 禁煙席
    charter: bool | str | None           # 貸切可
    parking: bool | str | None           # 駐車場
    barrier_free: bool | str | None      # バリアフリー
    pet: bool | str | None               # ペット可
    child: bool | str | None             # お子様連れ
    lunch: bool | str | None             # ランチ