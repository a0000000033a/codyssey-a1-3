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

API 키는 코드, README, 스크린샷, 커밋 기록에 노출하지 않습니다. 로컬 실행 시에는 `.env.local`에만 저장하고 Git에 커밋하지 않습니다.

## 로컬 실행

AI 추천과 맛집 검색까지 로컬에서 확인하려면 프로젝트에 포함된 Vercel CLI를 사용합니다. `.env.local`은 Git에서 제외되어 있습니다.

```bash
cp .env.example .env.local
# .env.local에 실제 API 키를 입력
./scripts/dev-local.sh --local
```

실행 후 브라우저에서 `http://localhost:3000`을 엽니다. 포트를 바꾸려면 `./scripts/dev-local.sh --local --listen 127.0.0.1:8080`처럼 실행합니다.

다른 컴퓨터에서 처음 실행할 때는 Node.js를 설치한 뒤 `npm install` 또는 `pnpm install`로 개발 의존성을 설치합니다. `.env.local`은 절대 커밋하지 않습니다.

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
