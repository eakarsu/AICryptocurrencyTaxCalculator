#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
[[ "${CONFIRM_DEMO_SEED:-}" == 'yes' && "${NODE_ENV:-development}" != 'production' ]] || { echo 'Demo seed requires CONFIRM_DEMO_SEED=yes and a non-production environment.' >&2; exit 2; }
(cd "$project_dir/backend" && node src/seeds/seed.js)
