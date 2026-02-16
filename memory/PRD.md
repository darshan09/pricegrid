# Tap-to-Trade Price Blocks Simulation - PRD

## Project Overview
A simulation-only trading UI for Indian stocks where users can tap price blocks to arm orders that auto-execute when the live price crosses the target level.

## Original Problem Statement
Build a Tap-to-Trade Price Blocks simulation with:
- Live simulated price line moving in real-time
- User taps a price block (target level)
- When moving price reaches that level, system auto-executes a simulated order
- UI shows states: IDLE → ARMED → TRIGGERED → EXECUTED
- No real exchange/brokerage APIs - pure UI + simulation

**User Requirements**:
- All prices in INR (₹) - no multipliers
- Indian stock simulation (NIFTY)

## Architecture

### Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Zustand (state) + Framer Motion (animations)
- **Chart**: Custom HTML5 Canvas for 60fps performance
- **Price Simulation**: Custom React hook with random walk algorithm

### Key Files
```
/app/frontend/src/
├── App.js                       # Main app component
├── hooks/
│   └── useMarketSimulation.js   # Price simulation engine
├── store/
│   └── tradingStore.js          # Zustand state management
├── components/
│   ├── ControlPanel.jsx         # Header with controls
│   ├── PriceGrid.jsx            # Grid container
│   ├── PriceBlock.jsx           # Individual tappable block
│   ├── LiveChart.jsx            # Canvas-based price chart
│   └── TradeLog.jsx             # Trade history panel
```

## User Personas
1. **Traders**: Testing tap-to-trade interaction before live trading
2. **Developers**: Validating latency feel and mental model
3. **Product Teams**: Prototyping trading UI concepts

## Core Requirements (Static)
- [x] Real-time price simulation
- [x] Tappable price blocks showing INR values
- [x] Block states: IDLE/ARMED/TRIGGERED/EXECUTED/CANCELLED
- [x] BUY/SELL order sides
- [x] Quantity selector
- [x] Auto-trigger when price crosses target
- [x] Trade log with P&L
- [x] Settings panel (volatility, tick rate)
- [x] Play/Pause/Reset controls
- [x] Toast notifications on execution

## What's Been Implemented (Jan 2026)
1. **Price Simulation Engine** - Random walk with occasional spikes
2. **48 Price Blocks Grid** - ₹2 increments around base price
3. **Canvas Chart** - Pink glow line with target markers
4. **Full State Machine** - IDLE → ARMED → EXECUTED flow
5. **Trade Logging** - Real-time P&L calculations
6. **Responsive Design** - Works on desktop and mobile
7. **Neon Theme** - Dark void background with pink/lime accents

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Real-time price updates
- [x] Block arming and execution
- [x] Visual feedback for states

### P1 (High Priority)
- [ ] Multi-block arming (arm multiple targets simultaneously)
- [ ] Price alert sounds on trigger
- [ ] Keyboard shortcuts (number keys for quick arm)

### P2 (Medium Priority)
- [ ] Candlestick chart option
- [ ] Order book simulation
- [ ] Position sizing calculator
- [ ] Export trade history to CSV

### P3 (Nice to Have)
- [ ] Multiple ticker support
- [ ] Custom price step configuration
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)

## Next Action Items
1. Add multi-block arming capability
2. Implement keyboard shortcuts for power users
3. Add sound effects toggle in settings
4. Consider position sizing/risk calculator
