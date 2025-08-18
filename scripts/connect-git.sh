#!/usr/bin/env bash
set -euo pipefail

GITHUB_USER="saksham114"
GITHUB_EMAIL="ssmstar13@gmail.com"
REPO_NAME="${1:-parafit-clone}"
VISIBILITY="${2:-public}"  # public|private|internal
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# 0) require git
if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git not found. Install git and re-run."
  exit 1
fi

# 1) init repo if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

# 2) .gitignore entries
touch .gitignore
ensure_ignore() { grep -qxF "$1" .gitignore 2>/dev/null || echo "$1" >> .gitignore; }
ensure_ignore "node_modules"
ensure_ignore ".next"
ensure_ignore ".vercel"
ensure_ignore ".env*"
ensure_ignore ".DS_Store"
ensure_ignore "npm-debug.log*"
ensure_ignore "yarn-error.log*"
ensure_ignore "pnpm-debug.log*"

# 3) basic identity if unset
git config --get user.name >/dev/null 2>&1 || git config --global user.name "${GITHUB_USER}"
git config --get user.email >/dev/null 2>&1 || git config --global user.email "${GITHUB_EMAIL}"

# 4) commit if needed
git add -A
if ! git rev-parse HEAD >/dev/null 2>&1; then
  git commit -m "mvp"
else
  if ! git diff --cached --quiet; then
    git commit -m "chore: snapshot before connecting GitHub"
  fi
fi

# 5) branch name
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [ -z "${CURRENT_BRANCH}" ] || [ "${CURRENT_BRANCH}" = "HEAD" ] || [ "${CURRENT_BRANCH}" = "master" ]; then
  CURRENT_BRANCH="main"
  git branch -M "${CURRENT_BRANCH}" || true
fi

# 6) set or create remote
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${REMOTE_URL}" || true
else
  git remote add origin "${REMOTE_URL}" || true
fi

# 7) create repo & push
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    # try to create; if it exists, just push
    if ! gh repo view "${GITHUB_USER}/${REPO_NAME}" >/dev/null 2>&1; then
      gh repo create "${GITHUB_USER}/${REPO_NAME}" --${VISIBILITY} --source=. --remote=origin --push
    else
      git push -u origin "${CURRENT_BRANCH}"
    fi
  else
    echo "GitHub CLI not logged in."
    echo "Run: gh auth login"
    echo "Then re-run: bash scripts/connect-git.sh \"${REPO_NAME}\" \"${VISIBILITY}\""
    exit 0
  fi
else
  echo "GitHub CLI (gh) not installed. Manual fallback:"
  echo "1) Create an EMPTY repo at: https://github.com/${GITHUB_USER}/${REPO_NAME}"
  echo "2) Then run:"
  echo "   git remote set-url origin ${REMOTE_URL} || git remote add origin ${REMOTE_URL}"
  echo "   git branch -M ${CURRENT_BRANCH}"
  echo "   git push -u origin ${CURRENT_BRANCH}"
fi

echo "✓ Remote: ${REMOTE_URL}"
echo "✓ Branch: ${CURRENT_BRANCH}"
