# pricegrid

A new take on the trading ladder — instead of a scrolling list of price levels, **pricegrid** displays prices as a spatial grid of tappable blocks. Arm a block, watch the market move, and execute — all without a traditional order form.

This is a simulation UI exploring whether a grid-based interaction model could be a faster, more intuitive way to trade. It's an open experiment, and contributions are very welcome.

## What it does

- Displays live price levels as a grid of blocks
- Tap to arm a price level; execution triggers automatically when price is hit
- Tracks open positions and running P&L in real time
- Trade log with per-trade entry price, target, and live P&L
- Simulated execution — no real orders, safe to experiment

## Why open source?

This UI concept is experimental and probably too radical to ship without real-world feedback. The goal is to find out if others find it useful, get contributions that sharpen the idea, and build evidence of acceptance before integrating it into a real trading platform.

If you trade, build trading tools, or just have opinions on UI — your feedback is genuinely valuable here.

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

## Project Structure

- `frontend/` — React app (grid UI, simulation controls, trade log, P&L)
- `backend/` — FastAPI service scaffold with Mongo-backed status endpoints
- `tests/` — Python-side tests

## Contributing

Contributions, ideas, and criticism are all welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) to get started.

## License

GNU AGPL v3 — see [`LICENSE`](./LICENSE). If you run a modified version as a network service, you must provide corresponding source to users of that service.

## Policies

- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- [`SECURITY.md`](./SECURITY.md)
- [`GOVERNANCE.md`](./GOVERNANCE.md)
