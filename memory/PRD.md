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
- Two grid generation modes: LTP Ladder & Depth Ladder

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
│   └── tradingStore.js          # Zustand state (includes ladder generators)
├── components/
│   ├── ControlPanel.jsx         # Header with controls + settings
│   ├── PriceGrid.jsx            # Dynamic grid container
│   ├── PriceBlock.jsx           # Individual tappable block
│   ├── LiveChart.jsx            # Canvas chart with bid/ask lines
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
- [x] Settings panel (volatility, tick rate, grid config)
- [x] Play/Pause/Reset controls
- [x] Toast notifications on execution

## What's Been Implemented (Jan 2026)

### Phase 1 - MVP
1. **Price Simulation Engine** - Random walk with occasional spikes
2. **48 Price Blocks Grid** - ₹2 increments around base price
3. **Canvas Chart** - Pink glow line with target markers
4. **Full State Machine** - IDLE → ARMED → EXECUTED flow
5. **Trade Logging** - Real-time P&L calculations

### Phase 2 - Grid Ladder Modes (Current)
1. **LTP_LADDER Mode** - Symmetric ladder centered around mid-price
   - Uses (bestBid + bestAsk) / 2 as anchor
   - Step = max(tickSize, spread)
   - Stable and visually clean

2. **DEPTH_LADDER Mode** - Market depth anchored
   - BUY: Anchors above bestAsk
   - SELL: Anchors below bestBid
   - Breakout-style execution ladder
   - Regenerates when switching BUY/SELL

3. **LIQUIDITY_LADDER Mode** - Impact price grid (Phase 2 Advanced)
   - Generates blocks from cumulative order book depth
   - Uses qty thresholds: [1, 5, 10, 25, 50, 100, 250, 500]
   - Shows "impact price" levels based on liquidity

4. **Grid Configuration Settings**
   - Ladder Mode toggle (LTP/DEPTH/LIQUIDITY)
   - Levels Per Side slider (5-25)
   - Tick Size slider (₹0.01-₹1.00)
   - Auto-recalc toggle with throttling (max 5/sec)

5. **Enhanced Price Display**
   - Delta (₹X.XX) with directional arrows
   - Percentage change (+/-X.XX%)
   - Color coding: green positive, pink negative

6. **Confirmation Dialogs**
   - Armed block re-click: "Cancel this order?"
   - Executed block re-click: "Square off this trade?"
   - Square-off creates opposite trade with realized P&L

7. **Enhanced Chart** - Shows bid/ask marker lines

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Real-time price updates
- [x] Block arming and execution
- [x] Visual feedback for states
- [x] Two grid generation modes

### P1 (High Priority)
- [ ] Multi-block arming (arm multiple targets simultaneously)
- [ ] Price alert sounds on trigger
- [ ] Keyboard shortcuts (number keys for quick arm)

### P2 (Medium Priority)
- [ ] Candlestick chart option
- [ ] Order book simulation display
- [ ] Position sizing calculator
- [ ] Export trade history to CSV

### P3 (Nice to Have)
- [ ] Multiple ticker support
- [ ] Real market data integration
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)

## Next Action Items
1. Add multi-block arming capability
2. Implement keyboard shortcuts for power users
3. Add sound effects toggle in settings
4. Consider order book visualization
