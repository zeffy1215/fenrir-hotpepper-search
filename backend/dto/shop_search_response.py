from dataclasses import dataclass

"""
レスポンシブ対応のためのサイズ別店舗トップ写真のURL
"""
@dataclass
class ShopPhoto:
    large: str                  # 店舗トップ写真(大) 
    medium: str                 # 店舗トップ写真(中)
    small: str                  # 店舗トップ写真(小)

"""
お店の営業時間を曜日ごとに分けたもの
"""
@dataclass
class ShopOpen:
    days: str                   # 曜日
    hours: str                  # 営業時間

"""
検索結果の一覧に表示する、店舗1件分の情報
ホットペッパーAPIの店舗情報のうち、一覧画面で必要な項目だけを持つ。
"""
@dataclass
class ShopInfo:
    id: str                     # 店舗ID
    name: str                   # 掲載店名
    name_kana: str              # 掲載店名(かな)
    
    address: str                # 住所
    access: str                 # お店アクセス

    genre_name: str             # お店のジャンル(name)
    sub_genre: str | None                # お店のサブジャンル

    catch: str                  # お店キャッチ

    open: list[ShopOpen] | str | None    # 営業時間
    close: str | None                    # 定休日

    photo: ShopPhoto            # 店舗トップ写真


"""
店舗検索API（GET /api/shops/search）がフロントエンドに返すレスポンス
店舗の一覧と、ページングに必要な件数の情報を返す
"""
@dataclass
class ShopListResponse:
    available: int              # 検索結果の全件数
    count: int                  # レスポンスに含まれる検索結果の件数
    start: int                  # 検索結果の開始位置

    shops: list[ShopInfo]       # 店舗情報
