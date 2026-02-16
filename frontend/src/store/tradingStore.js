import { create } from 'zustand';

// Generate unique ID for orders/trades only
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Block states
export const BlockState = {
  IDLE: 'IDLE',
  ARMED: 'ARMED',
  TRIGGERED: 'TRIGGERED',
  EXECUTED: 'EXECUTED',
  CANCELLED: 'CANCELLED',
};

// Order side
export const Side = {
  BUY: 'BUY',
  SELL: 'SELL',
};

// Grid modes
export const GridMode = {
  LTP_LADDER: 'LTP_LADDER',
  DEPTH_LADDER: 'DEPTH_LADDER',
  LIQUIDITY_LADDER: 'LIQUIDITY_LADDER',
};

// ============ UTILITY FUNCTIONS ============

// Round to tick size
function roundToTick(price, tick) {
  return Math.round(price / tick) * tick;
}

// Clamp to positive
function safePrice(price) {
  return Math.max(price, 0.01);
}

// Remove duplicates and sort descending
function uniqueSortedPrices(prices) {
  return [...new Set(prices.map(p => p.toFixed(2)).map(Number))].sort((a, b) => b - a);
}

// Generate DETERMINISTIC block ID from price, mode, side
function generateBlockId(price, mode, side) {
  return `block-${mode}-${side}-${price.toFixed(2)}`;
}

// ============ OPTION A: LTP-Based Tick Ladder ============
function generateLtpLadder(snapshot, config) {
  const { ltp, bestBid, bestAsk, tickSize } = snapshot;
  const { levelsPerSide } = config;

  const mid = bestBid && bestAsk
    ? (bestBid + bestAsk) / 2
    : ltp;

  // Fixed step for stability
  const step = tickSize * 5;

  const prices = [];

  for (let k = -levelsPerSide; k <= levelsPerSide; k++) {
    const raw = mid + k * step;
    const rounded = roundToTick(raw, tickSize);
    prices.push(safePrice(rounded));
  }

  return uniqueSortedPrices(prices);
}

// ============ OPTION B: Market Depth Anchored Ladder ============
function generateDepthLadder(snapshot, config, side) {
  const { bestBid, bestAsk, tickSize, ltp } = snapshot;
  const { levelsPerSide } = config;

  if (!bestBid || !bestAsk) {
    return generateLtpLadder(snapshot, config);
  }

  const anchor = side === Side.BUY ? bestAsk : bestBid;
  const prices = [];

  for (let i = 0; i < levelsPerSide * 2 + 1; i++) {
    const offset = i - levelsPerSide;
    let raw;
    if (side === Side.BUY) {
      raw = anchor + offset * tickSize;
    } else {
      raw = anchor - offset * tickSize;
    }
    prices.push(roundToTick(raw, tickSize));
  }

  return uniqueSortedPrices(prices);
}

// ============ OPTION C: Liquidity Weighted Levels ============
function generateLiquidityLadder(snapshot, config, side) {
  const { asks, bids, tickSize, bestAsk, bestBid } = snapshot;
  const { levelsPerSide, qtyThresholds = [1, 5, 10, 25, 50, 100, 250, 500] } = config;
  
  const orderBook = side === Side.BUY ? asks : bids;
  
  if (!orderBook || orderBook.length === 0) {
    return generateDepthLadder(snapshot, config, side);
  }
  
  const sorted = [...orderBook].sort((a, b) => 
    side === Side.BUY ? a.price - b.price : b.price - a.price
  );
  
  let cumulative = 0;
  const impactPrices = [];
  const usedThresholds = new Set();
  
  for (const level of sorted) {
    cumulative += level.qty;
    
    for (const threshold of qtyThresholds) {
      if (cumulative >= threshold && !usedThresholds.has(threshold)) {
        impactPrices.push(roundToTick(level.price, tickSize));
        usedThresholds.add(threshold);
      }
    }
    
    if (impactPrices.length >= levelsPerSide * 2 + 1) break;
  }
  
  const anchor = side === Side.BUY ? bestAsk : bestBid;
  while (impactPrices.length < levelsPerSide * 2 + 1) {
    const lastPrice = impactPrices[impactPrices.length - 1] || anchor;
    const nextPrice = side === Side.BUY 
      ? lastPrice + tickSize 
      : lastPrice - tickSize;
    impactPrices.push(roundToTick(nextPrice, tickSize));
  }
  
  return uniqueSortedPrices(impactPrices);
}

// Simulate order book for demo
const generateSimulatedOrderBook = (ltp, tickSize, levels = 20) => {
  const asks = [];
  const bids = [];
  
  for (let i = 1; i <= levels; i++) {
    const isLargeBlock = Math.random() < 0.15;
    const baseQty = Math.floor(Math.random() * 50) + 10;
    const qty = isLargeBlock ? baseQty * 10 : baseQty;
    
    asks.push({
      price: roundToTick(ltp + i * tickSize, tickSize),
      qty,
    });
    
    bids.push({
      price: roundToTick(ltp - i * tickSize, tickSize),
      qty: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return { asks, bids };
};

// ============ STORE ============
export const useTradingStore = create((set, get) => ({
  // Current market state
  basePrice: 2006,
  currentPrice: 2006.16,
  lastRecalcPrice: 2006.16,
  
  // Market snapshot
  marketSnapshot: {
    ltp: 2006.16,
    bestBid: 2006.00,
    bestAsk: 2006.50,
    tickSize: 0.05,
    bids: [],
    asks: [],
  },
  
  // Trading side
  side: Side.BUY,
  quantity: 1,
  
  // Grid prices (just numbers - visual suggestions only)
  gridPrices: [],
  
  // ===== INDEPENDENT STATE (persisted) =====
  // Armed orders - SEPARATE from grid, keyed by targetPrice
  armedOrders: new Map(), // Map<targetPrice, OrderIntent>
  
  // Executed trades
  trades: [],
  
  // Recalculation throttle
  lastRecalcTime: 0,
  recalcThrottleMs: 200,
  
  // Confirmation dialog state
  confirmDialog: {
    isOpen: false,
    type: null, // 'CANCEL_ORDER' | 'SQUARE_OFF' | 'CANCEL_ALL' | 'SQUARE_OFF_ALL'
    targetPrice: null,
    message: '',
  },
  
  // Settings
  settings: {
    volatility: 0.0005,
    tickRate: 50,
    gridMode: GridMode.LTP_LADDER,
    levelsPerSide: 12,
    tickSize: 0.05,
    qtyThresholds: [1, 5, 10, 25, 50, 100, 250, 500],
    autoRecalc: false,
    recalcStepMultiplier: 5,
  },
  
  // ===== PERSISTENCE =====
  
  // Save state to localStorage
  saveToStorage: () => {
    const { armedOrders, trades, side, quantity, settings } = get();
    const state = {
      armedOrders: Array.from(armedOrders.entries()),
      trades,
      side,
      quantity,
      settings,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem('tap-trade-state', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },
  
  // Load state from localStorage
  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem('tap-trade-state');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if saved within last hour
        if (Date.now() - state.savedAt < 3600000) {
          set({
            armedOrders: new Map(state.armedOrders || []),
            trades: state.trades || [],
            side: state.side || Side.BUY,
            quantity: state.quantity || 1,
            settings: { ...get().settings, ...state.settings },
          });
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
    return false;
  },
  
  // Clear storage
  clearStorage: () => {
    try {
      localStorage.removeItem('tap-trade-state');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  },
  
  // ===== HELPERS =====
  
  // Get block state by checking armed orders and trades
  getBlockState: (targetPrice) => {
    const { armedOrders, trades } = get();
    
    // Check if there's an active trade at this price
    const activeTrade = trades.find(t => 
      t.targetPrice === targetPrice && !t.isSquareOff
    );
    const squaredOff = activeTrade && trades.find(t => 
      t.originalTradeId === activeTrade.id
    );
    
    if (activeTrade && !squaredOff) {
      return BlockState.EXECUTED;
    }
    
    // Check if armed
    if (armedOrders.has(targetPrice)) {
      return BlockState.ARMED;
    }
    
    return BlockState.IDLE;
  },
  
  // Get armed order for a price
  getArmedOrder: (targetPrice) => {
    return get().armedOrders.get(targetPrice);
  },
  
  // Get trade for a price
  getTradeForPrice: (targetPrice) => {
    const { trades } = get();
    return trades.find(t => t.targetPrice === targetPrice && !t.isSquareOff);
  },
  
  // ===== DIALOG =====
  
  openConfirmDialog: (type, targetPrice, message) => {
    set({
      confirmDialog: { isOpen: true, type, targetPrice, message }
    });
  },
  
  closeConfirmDialog: () => {
    set({
      confirmDialog: { isOpen: false, type: null, targetPrice: null, message: '' }
    });
  },
  
  confirmDialogAction: () => {
    const { confirmDialog, armedOrders, trades, currentPrice, side } = get();
    const { type, targetPrice } = confirmDialog;
    
    if (type === 'CANCEL_ORDER') {
      // Remove single order from armed orders
      const newArmed = new Map(armedOrders);
      newArmed.delete(targetPrice);
      set({ armedOrders: newArmed });
      get().saveToStorage();
      
    } else if (type === 'CANCEL_ALL') {
      // Cancel ALL armed orders
      set({ armedOrders: new Map() });
      get().saveToStorage();
      
    } else if (type === 'SQUARE_OFF') {
      // Square off single position
      const originalTrade = trades.find(t => 
        t.targetPrice === targetPrice && !t.isSquareOff
      );
      
      if (originalTrade) {
        const squareOffSide = originalTrade.side === Side.BUY ? Side.SELL : Side.BUY;
        const now = Date.now();
        
        const squareOffTrade = {
          id: generateId(),
          ts: now,
          side: squareOffSide,
          qty: originalTrade.qty,
          targetPrice: currentPrice,
          execPrice: currentPrice,
          isSquareOff: true,
          originalTradeId: originalTrade.id,
        };
        
        set({ trades: [...trades, squareOffTrade] });
        get().saveToStorage();
      }
      
    } else if (type === 'SQUARE_OFF_ALL') {
      // Square off ALL open positions
      const now = Date.now();
      const openTrades = get().getOpenTrades();
      
      const squareOffTrades = openTrades.map(originalTrade => ({
        id: generateId(),
        ts: now,
        side: originalTrade.side === Side.BUY ? Side.SELL : Side.BUY,
        qty: originalTrade.qty,
        targetPrice: currentPrice,
        execPrice: currentPrice,
        isSquareOff: true,
        originalTradeId: originalTrade.id,
      }));
      
      set({ trades: [...trades, ...squareOffTrades] });
      get().saveToStorage();
    }
    
    get().closeConfirmDialog();
  },
  
  // ===== BULK ACTIONS =====
  
  // Show cancel all confirmation
  showCancelAllDialog: () => {
    const count = get().armedOrders.size;
    if (count === 0) return;
    
    get().openConfirmDialog(
      'CANCEL_ALL',
      null,
      `Cancel all ${count} armed order${count > 1 ? 's' : ''}?`
    );
  },
  
  // Show square off all confirmation
  showSquareOffAllDialog: () => {
    const openTrades = get().getOpenTrades();
    if (openTrades.length === 0) return;
    
    const totalPnL = get().getTotalPnL();
    const pnlStr = totalPnL >= 0 ? `+₹${totalPnL.toFixed(2)}` : `-₹${Math.abs(totalPnL).toFixed(2)}`;
    
    get().openConfirmDialog(
      'SQUARE_OFF_ALL',
      null,
      `Square off all ${openTrades.length} open position${openTrades.length > 1 ? 's' : ''}? Total P&L: ${pnlStr}`
    );
  },
  
  // Get open (non-squared-off) trades
  getOpenTrades: () => {
    const { trades } = get();
    const closedIds = new Set(
      trades.filter(t => t.isSquareOff).map(t => t.originalTradeId)
    );
    return trades.filter(t => !t.isSquareOff && !closedIds.has(t.id));
  },
  
  // ===== GRID REGENERATION =====
  
  shouldRecalculate: () => {
    const { currentPrice, lastRecalcPrice, lastRecalcTime, recalcThrottleMs, settings, marketSnapshot } = get();
    const now = Date.now();
    
    if (now - lastRecalcTime < recalcThrottleMs) {
      return false;
    }
    
    const step = settings.tickSize * 5;
    const priceDelta = Math.abs(currentPrice - lastRecalcPrice);
    
    return priceDelta >= step * settings.recalcStepMultiplier;
  },
  
  regenerateGrid: (force = false) => {
    const { marketSnapshot, settings, side, shouldRecalculate, currentPrice } = get();
    
    if (!force && !shouldRecalculate()) {
      return;
    }
    
    const { gridMode, levelsPerSide, tickSize, qtyThresholds } = settings;
    const config = { levelsPerSide, qtyThresholds };
    const snapshotWithTick = { ...marketSnapshot, tickSize };
    
    let prices;
    if (gridMode === GridMode.LIQUIDITY_LADDER) {
      prices = generateLiquidityLadder(snapshotWithTick, config, side);
    } else if (gridMode === GridMode.DEPTH_LADDER) {
      prices = generateDepthLadder(snapshotWithTick, config, side);
    } else {
      prices = generateLtpLadder(snapshotWithTick, config);
    }
    
    set({ 
      gridPrices: prices,
      lastRecalcTime: Date.now(),
      lastRecalcPrice: currentPrice,
    });
  },
  
  // ===== INITIALIZATION =====
  
  initializeBlocks: (basePrice) => {
    const { settings, side } = get();
    const { gridMode, levelsPerSide, tickSize, qtyThresholds } = settings;
    
    const spread = tickSize * 5;
    const orderBook = generateSimulatedOrderBook(basePrice, tickSize, 30);
    
    const snapshot = {
      ltp: basePrice,
      bestBid: basePrice - spread / 2,
      bestAsk: basePrice + spread / 2,
      tickSize,
      ...orderBook,
    };
    
    const config = { levelsPerSide, qtyThresholds };
    
    let prices;
    if (gridMode === GridMode.LIQUIDITY_LADDER) {
      prices = generateLiquidityLadder(snapshot, config, side);
    } else if (gridMode === GridMode.DEPTH_LADDER) {
      prices = generateDepthLadder(snapshot, config, side);
    } else {
      prices = generateLtpLadder(snapshot, config);
    }
    
    set({
      basePrice,
      currentPrice: basePrice,
      lastRecalcPrice: basePrice,
      marketSnapshot: snapshot,
      gridPrices: prices,
      armedOrders: new Map(),
      trades: [],
      lastRecalcTime: Date.now(),
    });
  },
  
  // ===== PRICE UPDATE =====
  
  updatePrice: (price) => {
    const { settings } = get();
    const { tickSize, autoRecalc } = settings;
    
    const spreadTicks = Math.floor(Math.random() * 10) + 1;
    const spread = spreadTicks * tickSize;
    
    const bestBid = roundToTick(price - spread / 2, tickSize);
    const bestAsk = roundToTick(price + spread / 2, tickSize);
    
    const shouldUpdateOrderBook = Math.random() < 0.1;
    const orderBook = shouldUpdateOrderBook 
      ? generateSimulatedOrderBook(price, tickSize, 30)
      : { asks: get().marketSnapshot.asks, bids: get().marketSnapshot.bids };
    
    set({ 
      currentPrice: price,
      marketSnapshot: {
        ...get().marketSnapshot,
        ltp: price,
        bestBid,
        bestAsk,
        ...orderBook,
      }
    });
    
    // Check triggers
    get().checkTriggers(price);
    
    // Auto-recalc if enabled
    if (autoRecalc) {
      get().regenerateGrid(false);
    }
  },
  
  // ===== SIDE & QUANTITY =====
  
  setSide: (newSide) => {
    const { side } = get();
    if (side !== newSide) {
      set({ side: newSide });
      get().regenerateGrid(true);
    }
  },
  
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  
  // ===== SETTINGS =====
  
  setGridMode: (mode) => {
    set(state => ({ settings: { ...state.settings, gridMode: mode } }));
    get().regenerateGrid(true);
  },
  
  setLevelsPerSide: (levels) => {
    set(state => ({ settings: { ...state.settings, levelsPerSide: levels } }));
    get().regenerateGrid(true);
  },
  
  setTickSize: (tickSize) => {
    set(state => ({
      settings: { ...state.settings, tickSize },
      marketSnapshot: { ...state.marketSnapshot, tickSize }
    }));
    get().regenerateGrid(true);
  },
  
  setAutoRecalc: (autoRecalc) => {
    set(state => ({ settings: { ...state.settings, autoRecalc } }));
  },
  
  // ===== BLOCK INTERACTION =====
  
  handleBlockClick: (targetPrice) => {
    const { armedOrders, trades, side, currentPrice } = get();
    
    const state = get().getBlockState(targetPrice);
    
    if (state === BlockState.IDLE) {
      // Arm at this price
      get().armAtPrice(targetPrice);
      
    } else if (state === BlockState.ARMED) {
      // Show cancel dialog
      get().openConfirmDialog(
        'CANCEL_ORDER',
        targetPrice,
        `Cancel this ${side} order at ₹${targetPrice.toFixed(2)}?`
      );
      
    } else if (state === BlockState.EXECUTED) {
      // Show square-off dialog
      const trade = get().getTradeForPrice(targetPrice);
      if (trade) {
        const pnl = trade.side === Side.BUY 
          ? (currentPrice - trade.execPrice) * trade.qty
          : (trade.execPrice - currentPrice) * trade.qty;
        const pnlStr = pnl >= 0 ? `+₹${pnl.toFixed(2)}` : `-₹${Math.abs(pnl).toFixed(2)}`;
        
        get().openConfirmDialog(
          'SQUARE_OFF',
          targetPrice,
          `Square off this trade? Current P&L: ${pnlStr}`
        );
      }
    }
  },
  
  // Arm at a specific price (independent of grid)
  armAtPrice: (targetPrice) => {
    const { armedOrders, side, quantity } = get();
    
    // Don't arm if already armed
    if (armedOrders.has(targetPrice)) return;
    
    const newArmed = new Map(armedOrders);
    newArmed.set(targetPrice, {
      id: generateId(),
      targetPrice,
      side,
      qty: quantity,
      state: 'ARMED',
      armedAt: Date.now(),
    });
    
    set({ armedOrders: newArmed });
    get().saveToStorage();
  },
  
  // Cancel armed order at price
  cancelAtPrice: (targetPrice) => {
    const { armedOrders } = get();
    const newArmed = new Map(armedOrders);
    newArmed.delete(targetPrice);
    set({ armedOrders: newArmed });
    get().saveToStorage();
  },
  
  // ===== TRIGGER CHECKING =====
  
  checkTriggers: (currentPrice) => {
    const { armedOrders, trades } = get();
    const now = Date.now();
    
    const newArmed = new Map(armedOrders);
    const newTrades = [];
    
    armedOrders.forEach((order, targetPrice) => {
      // Trigger condition
      const shouldTrigger = order.side === Side.BUY
        ? currentPrice <= targetPrice
        : currentPrice >= targetPrice;
      
      if (shouldTrigger) {
        // Remove from armed
        newArmed.delete(targetPrice);
        
        // Create trade
        newTrades.push({
          id: generateId(),
          ts: now,
          side: order.side,
          qty: order.qty,
          targetPrice: order.targetPrice,
          execPrice: currentPrice,
        });
      }
    });
    
    if (newTrades.length > 0) {
      set({
        armedOrders: newArmed,
        trades: [...trades, ...newTrades],
      });
    }
  },
  
  // ===== RESET =====
  
  resetAll: () => {
    set({ armedOrders: new Map(), trades: [] });
    get().regenerateGrid(true);
  },
  
  // ===== COMPUTED VALUES =====
  
  getArmedCount: () => get().armedOrders.size,
  
  getExecutedCount: () => {
    const { trades } = get();
    const openTrades = trades.filter(t => !t.isSquareOff);
    const closedIds = new Set(trades.filter(t => t.isSquareOff).map(t => t.originalTradeId));
    return openTrades.filter(t => !closedIds.has(t.id)).length;
  },
  
  getTotalPnL: () => {
    const { trades, currentPrice } = get();
    let pnl = 0;
    
    const tradeMap = new Map();
    trades.forEach(t => {
      if (!t.isSquareOff) {
        tradeMap.set(t.id, { open: t, close: null });
      }
    });
    trades.forEach(t => {
      if (t.isSquareOff && tradeMap.has(t.originalTradeId)) {
        tradeMap.get(t.originalTradeId).close = t;
      }
    });
    
    tradeMap.forEach(({ open, close }) => {
      if (close) {
        // Realized P&L
        pnl += open.side === Side.BUY
          ? (close.execPrice - open.execPrice) * open.qty
          : (open.execPrice - close.execPrice) * open.qty;
      } else {
        // Unrealized P&L
        pnl += open.side === Side.BUY
          ? (currentPrice - open.execPrice) * open.qty
          : (open.execPrice - currentPrice) * open.qty;
      }
    });
    
    return pnl;
  },
}));

export default useTradingStore;
