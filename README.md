# Tap-to-Trade Grid

A lightweight trading-simulator UI that lets users arm price levels on a live ladder, trigger simulated executions, square off positions, and monitor running P&L.

## Open Source Status

This repository is open source under the **GNU AGPL v3** license.

- You can use, modify, and redistribute it under AGPL terms.
- If you run a modified version as a network service, you must provide corresponding source to users of that service.

See [`LICENSE`](./LICENSE) for full text.

## Why AGPL?

AGPL is a strong copyleft license intended to keep improvements open, including for hosted/SaaS-style deployments. It helps prevent closed-source forks of networked versions while still welcoming community contributions.

## Project Policies

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- [`SECURITY.md`](./SECURITY.md)
- [`GOVERNANCE.md`](./GOVERNANCE.md)

## Project Structure

- `frontend/` — React app (grid UI, simulation controls, chart, local trade state)
- `backend/` — FastAPI service scaffold with Mongo-backed status endpoints
- `tests/` — Python-side tests and reports

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## Repository Setup Checklist (for maintainers)

After pushing this repository publicly, update placeholders to finalize governance:

1. Replace `OWNER/REPO` in `SECURITY.md` and `.github/ISSUE_TEMPLATE/config.yml`.
2. Update `.github/CODEOWNERS` with real GitHub usernames/teams.
3. Configure branch protection + required reviews.
4. Enable GitHub Security Advisories and Dependabot alerts.
