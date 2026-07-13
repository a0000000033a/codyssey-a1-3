import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlencode
from urllib.request import Request, urlopen


DEFAULT_FILTERS = {
    "radius": 1500,
    "size": 5,
    "categoryGroupCode": "FD6",
    "sort": "distance",
}

MAX_RADIUS = 20000
MAX_SIZE = 5


def _json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _read_json(handler):
    content_length = int(handler.headers.get("Content-Length", 0))
    if content_length <= 0:
        return {}
    raw_body = handler.rfile.read(content_length).decode("utf-8")
    return json.loads(raw_body)


def _safe_int(value, fallback, minimum, maximum):
    try:
        number = int(value)
    except (TypeError, ValueError):
        return fallback
    return max(minimum, min(number, maximum))


def _build_filters(raw_filters):
    raw_filters = raw_filters if isinstance(raw_filters, dict) else {}
    return {
        "radius": _safe_int(raw_filters.get("radius"), DEFAULT_FILTERS["radius"], 100, MAX_RADIUS),
        "size": _safe_int(raw_filters.get("size"), DEFAULT_FILTERS["size"], 1, MAX_SIZE),
        "categoryGroupCode": str(
            raw_filters.get("categoryGroupCode") or DEFAULT_FILTERS["categoryGroupCode"]
        ),
        "sort": str(raw_filters.get("sort") or DEFAULT_FILTERS["sort"]),
    }


def _normalize_place(place):
    return {
        "name": place.get("place_name", ""),
        "address": place.get("road_address_name") or place.get("address_name", ""),
        "phone": place.get("phone", ""),
        "distance": place.get("distance", ""),
        "url": place.get("place_url", ""),
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            kakao_key = os.environ.get("KAKAO_REST_API_KEY")
            if not kakao_key:
                _json_response(self, 500, {"error": "KAKAO_REST_API_KEY 환경 변수가 필요합니다."})
                return

            payload = _read_json(self)
            keyword = str(payload.get("keyword", "")).strip()[:40]
            latitude = float(payload.get("latitude"))
            longitude = float(payload.get("longitude"))
            filters = _build_filters(payload.get("filters"))

            if not keyword:
                _json_response(self, 400, {"error": "검색할 메뉴 키워드가 필요합니다."})
                return

            params = {
                "query": keyword,
                "x": longitude,
                "y": latitude,
                "radius": filters["radius"],
                "size": filters["size"],
                "sort": filters["sort"],
                "category_group_code": filters["categoryGroupCode"],
            }
            url = "https://dapi.kakao.com/v2/local/search/keyword.json?" + urlencode(params)
            request = Request(url, headers={"Authorization": f"KakaoAK {kakao_key}"})

            with urlopen(request, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))

            restaurants = [_normalize_place(place) for place in data.get("documents", [])]
            _json_response(self, 200, {"restaurants": restaurants})
        except (TypeError, ValueError):
            _json_response(self, 400, {"error": "위도와 경도 값이 올바르지 않습니다."})
        except Exception:
            _json_response(self, 500, {"error": "음식점 검색 처리 중 오류가 발생했습니다."})
