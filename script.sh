#!/usr/bin/env bash
# =============================================================================
#  script.sh — Pull from GitHub, install deps, run prerun commands & start
#              both backend and frontend servers for 4thsemProject
# =============================================================================
# Usage:
#   chmod +x script.sh
#   ./script.sh [--branch <branch>] [--skip-pull] [--backend-only] [--frontend-only]
#
# Options:
#   --branch <name>    Git branch to pull (default: main)
#   --skip-pull        Skip the git pull step (useful during local dev)
#   --backend-only     Start only the backend server
#   --frontend-only    Start only the frontend server
# =============================================================================

set -euo pipefail

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}${GREEN}▶ $*${RESET}"; }

# ─── Default configuration ────────────────────────────────────────────────────
REPO_URL="https://github.com/i-harshit-sharma/collaborative-code-editor.git"
BRANCH="master"
SKIP_PULL=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

# Resolve the directory where this script lives (repo root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# ─── Parse CLI arguments ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"; shift 2 ;;
    --skip-pull)
      SKIP_PULL=true; shift ;;
    --backend-only)
      BACKEND_ONLY=true; shift ;;
    --frontend-only)
      FRONTEND_ONLY=true; shift ;;
    -h|--help)
      sed -n '/^# Usage:/,/^# ====/p' "$0"
      exit 0 ;;
    *)
      error "Unknown argument: $1"; exit 1 ;;
  esac
done

# ─── Dependency checks ────────────────────────────────────────────────────────
step "Checking required tools"

for cmd in git node npm; do
  if command -v "$cmd" &>/dev/null; then
    success "$cmd found  →  $(${cmd} --version 2>&1 | head -1)"
  else
    error "$cmd is not installed or not in PATH. Aborting."
    exit 1
  fi
done

# Check Docker only if backend is involved (needs dockerode / setupImages)
if [[ "$FRONTEND_ONLY" == false ]]; then
  if command -v docker &>/dev/null; then
    success "docker found  →  $(docker --version 2>&1 | head -1)"
  else
    warn "Docker not found. The backend prerun step (setupImages.js) may fail."
  fi
fi

# ─── Git pull ─────────────────────────────────────────────────────────────────
step "Pulling latest code from GitHub"

if [[ "$SKIP_PULL" == true ]]; then
  warn "--skip-pull flag set. Skipping git pull."
else
  if [[ -d "${SCRIPT_DIR}/.git" ]]; then
    info "Fetching from origin ..."
    git -C "$SCRIPT_DIR" fetch --prune origin

    info "Checking out branch: ${BRANCH}"
    git -C "$SCRIPT_DIR" checkout "$BRANCH"

    info "Pulling latest commits ..."
    git -C "$SCRIPT_DIR" pull origin "$BRANCH"

    success "Repository is up-to-date on branch '${BRANCH}'."
  else
    info "No .git directory found. Cloning repository ..."
    git clone --branch "$BRANCH" "$REPO_URL" "$SCRIPT_DIR"
    success "Repository cloned into ${SCRIPT_DIR}."
  fi
fi

# ─── Backend setup ────────────────────────────────────────────────────────────
if [[ "$FRONTEND_ONLY" == false ]]; then

  step "Installing backend dependencies"
  cd "$BACKEND_DIR"

  if [[ ! -f "package.json" ]]; then
    error "backend/package.json not found. Aborting."
    exit 1
  fi

  npm install
  success "Backend dependencies installed."

  # Check for .env file
  if [[ ! -f ".env" ]]; then
    error ".env file not found in backend/. Please create one before running."
    error "Required variables: PORT, MONGO_URI, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY"
    error "Example: cp backend/.env.example backend/.env  (then fill in the values)"
    exit 1
  else
    success ".env file detected."
  fi

  # ── Prerun: node scripts/setupImages.js ───────────────────────────────────
  step "Running backend prerun command (scripts/setupImages.js)"
  if [[ -f "scripts/setupImages.js" ]]; then
    info "Executing: node scripts/setupImages.js"
    node scripts/setupImages.js
    success "Prerun completed successfully."
  else
    warn "scripts/setupImages.js not found. Skipping prerun."
  fi

fi

# ─── Frontend setup ───────────────────────────────────────────────────────────
if [[ "$BACKEND_ONLY" == false ]]; then

  step "Installing frontend dependencies"
  cd "$FRONTEND_DIR"

  if [[ ! -f "package.json" ]]; then
    error "frontend/package.json not found. Aborting."
    exit 1
  fi

  npm install
  success "Frontend dependencies installed."

fi

# ─── Start servers ────────────────────────────────────────────────────────────
step "Starting servers"

# Trap Ctrl+C to kill all background processes gracefully
cleanup() {
  echo ""
  warn "Shutting down servers ..."
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
  success "Servers stopped. Goodbye!"
  exit 0
}
trap cleanup SIGINT SIGTERM

if [[ "$FRONTEND_ONLY" == false && "$BACKEND_ONLY" == false ]]; then
  # ── Both servers ────────────────────────────────────────────────────────────
  info "Starting backend  (node index.js)  ..."
  cd "$BACKEND_DIR"
  node index.js &
  BACKEND_PID=$!
  success "Backend started  [PID: ${BACKEND_PID}]  →  http://localhost:$(grep -m1 '^PORT=' .env 2>/dev/null | cut -d= -f2 || echo 4000)"

  info "Starting frontend (vite dev server) ..."
  cd "$FRONTEND_DIR"
  npm run dev &
  FRONTEND_PID=$!
  success "Frontend started [PID: ${FRONTEND_PID}]  →  http://localhost:5173"

  info "Press Ctrl+C to stop both servers."
  wait "${BACKEND_PID}" "${FRONTEND_PID}"

elif [[ "$BACKEND_ONLY" == true ]]; then
  # ── Backend only ────────────────────────────────────────────────────────────
  info "Starting backend  (node index.js)  ..."
  cd "$BACKEND_DIR"
  node index.js &
  BACKEND_PID=$!
  success "Backend started  [PID: ${BACKEND_PID}]  →  http://localhost:$(grep -m1 '^PORT=' .env 2>/dev/null | cut -d= -f2 || echo 4000)"

  info "Press Ctrl+C to stop the server."
  wait "${BACKEND_PID}"

elif [[ "$FRONTEND_ONLY" == true ]]; then
  # ── Frontend only ───────────────────────────────────────────────────────────
  info "Starting frontend (vite dev server) ..."
  cd "$FRONTEND_DIR"
  npm run dev &
  FRONTEND_PID=$!
  success "Frontend started [PID: ${FRONTEND_PID}]  →  http://localhost:5173"

  info "Press Ctrl+C to stop the server."
  wait "${FRONTEND_PID}"
fi
