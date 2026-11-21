from dataclasses import dataclass

"""
ジャンルに対応するコードとジャンル
ReactのSelectで直接使えるためにキーをvalueとlabelに統一
"""
@dataclass
class Genre:
    value: str          # コード
    label: str          # ジャンル

"""
ジャンルマスタAPIがフロントエンドに返すレスポンス
"""
@dataclass
class GenreMasterResponse:
    genre: list[Genre]   # ジャンルのリスト
