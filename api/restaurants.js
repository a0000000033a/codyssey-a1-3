function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 0);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(body);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const apiKey = process.env.KAKAO_REST_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: "KAKAO_REST_API_KEY 환경 변수가 필요합니다." });
      return;
    }

    const payload = await readJsonBody(req);
    const keyword = String(payload?.keyword || "한식");
    const latitude = Number(payload?.latitude || 37.489116);
    const longitude = Number(payload?.longitude || 127.06614);
    const filters = payload?.filters || {};
    const radius = Number(filters.radius || 1500);
    const size = Number(filters.size || 5);

    const params = new URLSearchParams({
      query: keyword,
      x: String(longitude),
      y: String(latitude),
      radius: String(radius),
      size: String(size),
      sort: String(filters.sort || "distance")
    });

    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Kakao API 요청에 실패했습니다.");
    }

    const restaurants = (data.documents || []).map((item) => ({
      name: item.place_name || item.name || "이름 없음",
      address: item.road_address_name || item.address_name || "주소 정보 없음",
      phone: item.phone || "전화번호 정보 없음",
      url: item.place_url || "",
      distance: item.distance || ""
    }));

    sendJson(res, 200, { restaurants });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "음식점 검색 중 오류가 발생했습니다." });
  }
};
