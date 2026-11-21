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
大エリアマスタAPI（GET /api/areas/large）がフロントエンドに返すレスポンス
"""
@dataclass
class LargeMasterResponse:
    areas: list[Area]   # 都道府県のリスト