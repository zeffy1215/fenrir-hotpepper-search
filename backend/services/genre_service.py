from dto.genre_master_response import Genre, GenreMasterResponse
from .hotpepper_service import request_genre_master

def get_genre_master() -> GenreMasterResponse:
    results = request_genre_master()
    genres = [Genre(value=genre["code"], label=genre["name"]) for genre in results["genre"]]
    return GenreMasterResponse(genres=genres)

