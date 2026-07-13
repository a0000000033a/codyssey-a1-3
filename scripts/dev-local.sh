#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEX_NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"

# Prefer a normally installed Node.js. Fall back to the runtime bundled with Codex.
if ! command -v node >/dev/null 2>&1 && [ -x "$CODEX_NODE_BIN/node" ]; then
  export PATH="$CODEX_NODE_BIN:$PATH"
fi

# Prefer Python 3.12 for Vercel's local runtime so newer syntax in the runtime can execute.
for python_dir in \
  "/usr/local/opt/python@3.12/bin" \
  "/opt/homebrew/bin" \
  "/usr/local/bin"
 do
  if [ -x "$python_dir/python3.12" ]; then
    export PATH="$python_dir:$PATH"
    break
  fi
done

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js가 필요합니다. Node.js를 설치한 뒤 다시 실행해 주세요." >&2
  exit 1
fi

if [ ! -x "$PROJECT_DIR/node_modules/.bin/vercel" ]; then
  echo "로컬 의존성이 없습니다. 프로젝트 루트에서 패키지를 설치해 주세요." >&2
  exit 1
fi

# Keep Vercel's local configuration and cache inside the ignored project folder.
export HOME="$PROJECT_DIR/.vercel-home"

# Load local environment variables so the serverless functions can access
# secrets such as OPENAI_API_KEY during local development.
if [ -f "$PROJECT_DIR/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_DIR/.env.local"
  set +a
fi

exec "$PROJECT_DIR/node_modules/.bin/vercel" dev \
  --global-config "$PROJECT_DIR/.vercel-home" \
  "$@"
