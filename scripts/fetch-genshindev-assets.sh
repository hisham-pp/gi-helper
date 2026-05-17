#!/usr/bin/env bash

set -euo pipefail

REPO_URL="https://github.com/codeuriii/forkgenshinapi.git"
BRANCH="mistress"
DEST_IMAGES="public/images"
DEST_DATA="data"
CLEAN_DEST="true"

usage() {
  cat <<'EOF'
Usage: scripts/fetch-genshindev-assets.sh [options]

Fetches selected content from the genshindev/api repository and syncs it into
this project:
  assets/images -> public/images
  assets/data   -> data

Options:
  -b, --branch <name>     Branch, tag, or ref to fetch from (default: main)
      --repo <url>        Override source repository URL
      --images-dir <dir>  Destination for assets/images (default: public/images)
      --data-dir <dir>    Destination for assets/data (default: data)
      --no-clean          Do not delete files in destination that no longer
                          exist in the source
  -h, --help              Show this help

Examples:
  scripts/fetch-genshindev-assets.sh
  scripts/fetch-genshindev-assets.sh --branch dev
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

sync_dir() {
  local src="$1"
  local dest="$2"

  mkdir -p "$dest"

  if [[ "$CLEAN_DEST" == "true" ]]; then
    rsync -a --delete "$src"/ "$dest"/
  else
    rsync -a "$src"/ "$dest"/
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --repo)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --images-dir)
      DEST_IMAGES="${2:-}"
      shift 2
      ;;
    --data-dir)
      DEST_DATA="${2:-}"
      shift 2
      ;;
    --no-clean)
      CLEAN_DEST="false"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  echo "Branch cannot be empty." >&2
  exit 1
fi

require_command git
require_command rsync
require_command mktemp

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

echo "Fetching '$BRANCH' from $REPO_URL"

git clone \
  --depth 1 \
  --filter=blob:none \
  --sparse \
  --branch "$BRANCH" \
  "$REPO_URL" \
  "$TMP_DIR/repo"

cd "$TMP_DIR/repo"
git sparse-checkout set assets/images assets/data

if [[ ! -d "assets/images" ]]; then
  echo "Source path not found: assets/images" >&2
  exit 1
fi

if [[ ! -d "assets/data" ]]; then
  echo "Source path not found: assets/data" >&2
  exit 1
fi

echo "Syncing assets/images -> $DEST_IMAGES"
sync_dir "$TMP_DIR/repo/assets/images" "$REPO_ROOT/$DEST_IMAGES"

echo "Syncing assets/data -> $DEST_DATA"
sync_dir "$TMP_DIR/repo/assets/data" "$REPO_ROOT/$DEST_DATA"

echo "Sync complete."
