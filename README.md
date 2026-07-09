# 밥밥

밥밥은 사용자가 적은 상황 문장을 바탕으로 AI가 오늘 먹을 메뉴를 추천하고, 추천 메뉴로 근처 음식점을 찾아주는 웹 서비스입니다.

## 주요 기능

- 자유 텍스트 입력 기반 AI 메뉴 추천
- 추천 메뉴, 추천 이유, 검색 키워드, 태그를 JSON 형식으로 정규화
- 현재 위치 기반 Kakao 음식점 검색
- 위치 권한 거부 시 개포동역 기준 검색
- 모바일과 데스크톱 반응형 UI

## 기술 스택

- Frontend: HTML, CSS, JavaScript
- Backend: Vercel Serverless Functions, Python
- AI API: OpenAI API
- Place Search: Kakao Local API
- Deploy: Vercel

## 프로젝트 구조

```text
.
├── index.html
├── answer.html
├── restaurants.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── api/
│   ├── recommend.py
│   └── restaurants.py
├── images/
├── evidence/
├── requirements.txt
└── SERVICE_PLAN.md
```

## 환경 변수

Vercel 프로젝트 설정에서 아래 환경 변수를 등록합니다.

```text
OPENAI_API_KEY=OpenAI API 키
OPENAI_MODEL=gpt-4o-mini
KAKAO_REST_API_KEY=Kakao Developers REST API 키
```

API 키는 코드, README, 스크린샷, 커밋 기록에 노출하지 않습니다.

## 로컬 실행

정적 화면만 확인할 때는 `index.html`을 브라우저로 열 수 있습니다. API까지 로컬에서 확인하려면 Vercel CLI를 사용합니다.

```bash
npm install -g vercel
vercel dev
```

로컬 환경 변수는 Vercel CLI 안내에 따라 설정하거나 `.env.local`을 사용합니다. `.env.local`은 커밋하지 않습니다.

## 배포

1. GitHub 저장소에 프로젝트 코드를 업로드합니다.
2. Vercel에서 GitHub 저장소를 Import합니다.
3. 환경 변수 `OPENAI_API_KEY`, `OPENAI_MODEL`, `KAKAO_REST_API_KEY`를 등록합니다.
4. 배포 후 발급된 URL에서 입력, AI 답변, 맛집 검색 기능을 확인합니다.

## 배포 URL

배포 후 아래에 Vercel URL을 입력합니다.

```text
https://your-project.vercel.app
```
