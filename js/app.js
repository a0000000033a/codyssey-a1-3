const STORAGE_KEY = "bapbapRecommendation";

const DEFAULT_LOCATION = {
  latitude: 37.489116,
  longitude: 127.06614,
  label: "개포동역"
};

const RESTAURANT_SEARCH_CONFIG = {
  radius: 1500,
  size: 5,
  categoryGroupCode: "FD6",
  sort: "distance"
};

const $ = (selector) => document.querySelector(selector);

function sanitizePrompt(value) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function loadRecommendation() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveRecommendation(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setStatus(element, message) {
  if (element) {
    element.textContent = message || "";
  }
}

function renderTags(container, tags = []) {
  if (!container) return;
  container.innerHTML = "";
  tags.slice(0, 5).forEach((tag) => {
    const badge = document.createElement("span");
    badge.className = "tag";
    badge.textContent = `#${tag}`;
    container.appendChild(badge);
  });
}

function initPromptPage() {
  const form = $("#recommendForm");
  const input = $("#promptInput");
  const count = $("#charCount");
  const status = $("#formStatus");

  if (!form || !input) return;

  input.addEventListener("input", () => {
    count.textContent = `${input.value.length} / 300`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = sanitizePrompt(input.value);

    if (!prompt) {
      setStatus(status, "먹고 싶은 상황을 한 문장 이상 입력해 주세요.");
      input.focus();
      return;
    }

    if (prompt.length > 300) {
      setStatus(status, "입력은 300자 이내로 줄여 주세요.");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    setStatus(status, "밥밥이 메뉴를 고르는 중입니다...");

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      window.clearTimeout(timeoutId);

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "AI 추천 요청에 실패했습니다.");
      }

      saveRecommendation({
        prompt,
        menu: payload.menu,
        reason: payload.reason,
        searchKeyword: payload.searchKeyword || payload.menu,
        tags: Array.isArray(payload.tags) ? payload.tags : []
      });

      window.location.href = "./answer.html";
    } catch (error) {
      const message =
        error.name === "AbortError"
          ? "응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
          : error.message;
      setStatus(status, message);
    } finally {
      button.disabled = false;
    }
  });
}

function initAnswerPage() {
  const title = $("#menuTitle");
  const reason = $("#menuReason");
  const menuName = $("#menuName");
  const keyword = $("#searchKeyword");
  const prompt = $("#originalPrompt");
  const tags = $("#tagList");

  if (!title || !reason || !menuName) return;

  const data = loadRecommendation();
  if (!data) return;

  title.textContent = `${data.menu} 어때요?`;
  reason.textContent = data.reason;
  menuName.textContent = data.menu;
  keyword.textContent = `검색어: ${data.searchKeyword}`;
  prompt.textContent = data.prompt;
  renderTags(tags, data.tags);
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...DEFAULT_LOCATION, usedDefault: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "현재 위치",
          usedDefault: false
        });
      },
      () => resolve({ ...DEFAULT_LOCATION, usedDefault: true }),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 300000 }
    );
  });
}

function renderRestaurants(restaurants) {
  const list = $("#restaurantList");
  if (!list) return;

  list.innerHTML = "";
  restaurants.forEach((restaurant) => {
    const item = document.createElement("article");
    item.className = "restaurant-item";

    const content = document.createElement("div");
    const title = document.createElement("h3");
    const address = document.createElement("p");
    const phone = document.createElement("p");
    const link = document.createElement("a");

    title.textContent = restaurant.name;
    address.textContent = restaurant.address || "주소 정보 없음";
    phone.textContent = restaurant.phone || "전화번호 정보 없음";
    link.href = restaurant.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "secondary-button";
    link.textContent = "상세 보기";

    content.append(title, address, phone, link);

    const distance = document.createElement("span");
    distance.className = "distance-pill";
    distance.textContent = restaurant.distance ? `${restaurant.distance}m` : "거리 -";

    item.append(content, distance);
    list.appendChild(item);
  });
}

function initRestaurantsPage() {
  const button = $("#searchRestaurantsButton");
  const status = $("#restaurantStatus");
  const title = $("#restaurantTitle");
  const meta = $("#searchMeta");
  const locationCopy = $("#locationCopy");

  if (!button) return;

  const data = loadRecommendation();
  const keyword = data?.searchKeyword || "한식";
  if (title) {
    title.textContent = `${keyword} 맛집을 찾아볼게요.`;
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    setStatus(status, "위치를 확인하고 음식점을 검색하는 중입니다...");

    try {
      const location = await getCurrentLocation();
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          latitude: location.latitude,
          longitude: location.longitude,
          filters: RESTAURANT_SEARCH_CONFIG
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "음식점 검색에 실패했습니다.");
      }

      const baseLabel = location.usedDefault ? "개포동역 기준" : "현재 위치 기준";
      locationCopy.textContent = `${baseLabel}으로 가까운 음식점을 보여드립니다.`;
      meta.textContent = `${baseLabel} · ${keyword} · 최대 ${RESTAURANT_SEARCH_CONFIG.size}개`;

      if (!payload.restaurants || payload.restaurants.length === 0) {
        $("#restaurantList").innerHTML =
          '<p class="muted-text">조건에 맞는 음식점을 찾지 못했습니다.</p>';
        setStatus(status, "");
        return;
      }

      renderRestaurants(payload.restaurants);
      setStatus(status, "검색이 완료되었습니다.");
    } catch (error) {
      setStatus(status, error.message);
    } finally {
      button.disabled = false;
    }
  });
}

initPromptPage();
initAnswerPage();
initRestaurantsPage();
