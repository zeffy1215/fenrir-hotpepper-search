from dataclasses import dataclass

"""
エリアに対応するコードと地名
ReactのSelectで直接使えるためにキーをvalueとlabelに統一
"""
@dataclass
class Area:
    value: str          # コード
    label: str          # 地名

"""
エリアマスタAPIがフロントエンドに返すレスポンス
"""
@dataclass
class AreaMasterResponse:
    areas: list[Area]   # エリアのリスト
