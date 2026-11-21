from dataclasses import asdict
from .hotpepper_service import request_large_area_master

def get_large_area_master():
    results = request_large_area_master
    return results
