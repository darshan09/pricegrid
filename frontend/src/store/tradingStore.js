import { create } from 'zustand';

// Generate unique ID
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

// ============ OPTION A: LTP-Based Tick Ladder ============
function generateLtpLadder(snapshot, config) {
  const { ltp, bestBid, bestAsk, tickSize } = snapshot;
  const { levelsPerSide } = config;

  const mid = bestBid && bestAsk
    ? (bestBid + bestAsk) / 2
    : ltp;

  const spread = bestBid && bestAsk
    ? bestAsk - bestBid
    : tickSize;
  
  const step = Math.max(tickSize, spread);

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
    console.warn("No depth data, falling back to LTP ladder");
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

// ============ OPTION C: Liquidity Weighted Levels (Phase 2) ============
function generateLiquidityLadder(snapshot, config, side) {
  const { asks, bids, tickSize, bestAsk, bestBid, ltp } = snapshot;
  const { levelsPerSide, qtyThresholds = [1, 5, 10, 25, 50, 100, 250, 500] } = config;
  
  // Use asks for BUY (we're buying into asks), bids for SELL
  const orderBook = side === Side.BUY ? asks : bids;
  
  // Fallback if no order book data
  if (!orderBook || orderBook.length === 0) {
    console.warn("No order book data, falling back to Depth ladder");
    return generateDepthLadder(snapshot, config, side);
  }
  
  // Sort by price (ascending for asks, descending for bids)
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
    
    // Stop once we have enough levels
    if (impactPrices.length >= levelsPerSide * 2 + 1) break;
  }
  
  // If we don't have enough levels, fill with tick-based levels
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

// Generate price blocks from prices array
const generateBlocksFromPrices = (prices, currentLtp, existingBlocks = []) => {
  // Create a map of existing armed/executed blocks by target price
  const existingStates = new Map();
  existingBlocks.forEach(block => {
    if (block.state === BlockState.ARMED || block.state === BlockState.EXECUTED) {
      existingStates.set(block.targetPrice, {
        state: block.state,
        armedAt: block.armedAt,
        executedAt: block.executedAt,
        triggeredAt: block.triggeredAt,
      });
    }
  });
  
  return prices.map(targetPrice => {
    // Check if this price level had a preserved state
    const preserved = existingStates.get(targetPrice);
    
    return {
      id: generateId(),
      label: `₹${targetPrice.toLocaleString('en-IN')}`,
      targetPrice,
      state: preserved ? preserved.state : BlockState.IDLE,
      createdAt: Date.now(),
      armedAt: preserved?.armedAt,
      executedAt: preserved?.executedAt,
      triggeredAt: preserved?.triggeredAt,
    };
  });
};

// Simulate order book for demo
const generateSimulatedOrderBook = (ltp, tickSize, levels = 20) => {
  const asks = [];
  const bids = [];
  
  for (let i = 1; i <= levels; i++) {
    // Random qty with some large blocks at certain levels
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

export const useTradingStore = create((set, get) => ({
  // Current market state
  basePrice: 2006,
  currentPrice: 2006.16,
  lastRecalcPrice: 2006.16,
  
  // Market snapshot for ladder generation
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
  
  // Price blocks
  blocks: [],
  
  // Orders and trades
  orders: [],
  trades: [],
  
  // Recalculation throttle
  lastRecalcTime: 0,
  recalcThrottleMs: 200, // Max 5 times per second
  isRegenerating: false, // Flag to prevent clicks during regeneration
  
  // Confirmation dialog state
  confirmDialog: {
    isOpen: false,
    type: null, // 'SQUARE_OFF' | 'CANCEL_ORDER'
    blockId: null,
    message: '',
  },
  
  // Settings
  settings: {
    volatility: 0.0005,
    tickRate: 50,
    gridSize: { rows: 6, cols: 8 },
    gridMode: GridMode.LTP_LADDER,
    levelsPerSide: 12,
    tickSize: 0.05,
    qtyThresholds: [1, 5, 10, 25, 50, 100, 250, 500],
    autoRecalc: true,
    recalcStepMultiplier: 1, // Recalc when LTP moves more than N steps
  },
  
  // Open confirmation dialog
  openConfirmDialog: (type, blockId, message) => {
    set({
      confirmDialog: {
        isOpen: true,
        type,
        blockId,
        message,
      }
    });
  },
  
  // Close confirmation dialog
  closeConfirmDialog: () => {
    set({
      confirmDialog: {
        isOpen: false,
        type: null,
        blockId: null,
        message: '',
      }
    });
  },
  
  // Confirm dialog action
  confirmDialogAction: () => {
    const { confirmDialog, blocks, orders, trades, currentPrice, side, quantity } = get();
    const { type, blockId } = confirmDialog;
    
    if (type === 'CANCEL_ORDER') {
      // Cancel the armed order
      set({
        blocks: blocks.map(b =>
          b.id === blockId && b.state === BlockState.ARMED
            ? { ...b, state: BlockState.IDLE, armedAt: undefined }
            : b
        ),
        orders: orders.map(o =>
          o.blockId === blockId && o.state === 'ARMED'
            ? { ...o, state: 'CANCELLED' }
            : o
        ),
      });
    } else if (type === 'SQUARE_OFF') {
      // Create opposite trade to square off
      const block = blocks.find(b => b.id === blockId);
      const originalTrade = trades.find(t => t.blockId === blockId);
      
      if (block && originalTrade) {
        const squareOffSide = originalTrade.side === Side.BUY ? Side.SELL : Side.BUY;
        const now = Date.now();
        
        // Add square-off trade
        const squareOffTrade = {
          id: generateId(),
          ts: now,
          side: squareOffSide,
          qty: originalTrade.qty,
          triggerPrice: currentPrice,
          execPrice: currentPrice,
          blockId: blockId,
          isSquareOff: true,
          originalTradeId: originalTrade.id,
        };
        
        // Reset block to idle
        set({
          blocks: blocks.map(b =>
            b.id === blockId
              ? { ...b, state: BlockState.IDLE, armedAt: undefined, executedAt: undefined, triggeredAt: undefined }
              : b
          ),
          trades: [...trades, squareOffTrade],
        });
      }
    }
    
    get().closeConfirmDialog();
  },
  
  // Update market snapshot
  updateMarketSnapshot: (snapshot) => {
    set({ marketSnapshot: { ...get().marketSnapshot, ...snapshot } });
  },
  
  // Should recalculate grid (throttled)
  shouldRecalculate: () => {
    const { currentPrice, lastRecalcPrice, lastRecalcTime, recalcThrottleMs, settings, marketSnapshot } = get();
    const now = Date.now();
    
    // Check throttle
    if (now - lastRecalcTime < recalcThrottleMs) {
      return false;
    }
    
    // Check if price moved more than N steps
    const step = Math.max(settings.tickSize, (marketSnapshot.bestAsk || 0) - (marketSnapshot.bestBid || 0) || settings.tickSize);
    const priceDelta = Math.abs(currentPrice - lastRecalcPrice);
    
    return priceDelta >= step * settings.recalcStepMultiplier;
  },
  
  // Regenerate blocks based on current mode (with state preservation)
  regenerateBlocks: (force = false) => {
    const { marketSnapshot, settings, side, blocks, shouldRecalculate, currentPrice } = get();
    
    // Check throttle unless forced
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
    
    // Preserve states for prices that still exist
    const newBlocks = generateBlocksFromPrices(prices, marketSnapshot.ltp, blocks);
    
    // Find armed orders whose target prices no longer exist in new grid
    const newPriceSet = new Set(prices);
    const { orders } = get();
    const updatedOrders = orders.map(order => {
      if (order.state === 'ARMED' && !newPriceSet.has(order.targetPrice)) {
        // Cancel orders that no longer have matching blocks
        return { ...order, state: 'CANCELLED' };
      }
      return order;
    });
    
    set({ 
      blocks: newBlocks, 
      orders: updatedOrders,
      lastRecalcTime: Date.now(),
      lastRecalcPrice: currentPrice,
    });
  },
  
  // Initialize blocks
  initializeBlocks: (basePrice) => {
    const { settings, side } = get();
    const { gridMode, levelsPerSide, tickSize, qtyThresholds } = settings;
    
    // Create initial market snapshot with simulated order book
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
    
    const blocks = generateBlocksFromPrices(prices, basePrice);
    
    set({
      basePrice,
      currentPrice: basePrice,
      lastRecalcPrice: basePrice,
      marketSnapshot: snapshot,
      blocks,
      orders: [],
      trades: [],
      lastRecalcTime: Date.now(),
    });
  },
  
  // Update current price (and simulate depth)
  updatePrice: (price) => {
    const { settings, side } = get();
    const { tickSize, autoRecalc } = settings;
    
    // Simulate spread (random 1-10 ticks)
    const spreadTicks = Math.floor(Math.random() * 10) + 1;
    const spread = spreadTicks * tickSize;
    
    const bestBid = roundToTick(price - spread / 2, tickSize);
    const bestAsk = roundToTick(price + spread / 2, tickSize);
    
    // Regenerate simulated order book occasionally
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
    
    // Check for triggers
    get().checkTriggers(price);
    
    // Auto-recalculate grid if enabled
    if (autoRecalc) {
      get().regenerateBlocks(false);
    }
  },
  
  // Toggle side (BUY/SELL)
  toggleSide: () => {
    set(state => ({
      side: state.side === Side.BUY ? Side.SELL : Side.BUY,
    }));
    get().regenerateBlocks(true);
  },
  
  // Set side directly
  setSide: (newSide) => {
    const { side } = get();
    if (side !== newSide) {
      set({ side: newSide });
      get().regenerateBlocks(true);
    }
  },
  
  // Set quantity
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  
  // Set grid mode
  setGridMode: (mode) => {
    set(state => ({
      settings: { ...state.settings, gridMode: mode }
    }));
    get().regenerateBlocks(true);
  },
  
  // Set levels per side
  setLevelsPerSide: (levels) => {
    set(state => ({
      settings: { ...state.settings, levelsPerSide: levels }
    }));
    get().regenerateBlocks(true);
  },
  
  // Set tick size
  setTickSize: (tickSize) => {
    set(state => ({
      settings: { ...state.settings, tickSize },
      marketSnapshot: { ...state.marketSnapshot, tickSize }
    }));
    get().regenerateBlocks(true);
  },
  
  // Set auto recalc
  setAutoRecalc: (autoRecalc) => {
    set(state => ({
      settings: { ...state.settings, autoRecalc }
    }));
  },
  
  // Handle block click with confirmation dialogs
  handleBlockClick: (blockId) => {
    const { blocks, side, quantity, orders } = get();
    const block = blocks.find(b => b.id === blockId);
    
    if (!block) return;
    
    if (block.state === BlockState.IDLE) {
      // Arm the block
      get().armBlock(blockId);
    } else if (block.state === BlockState.ARMED) {
      // Show cancel confirmation
      get().openConfirmDialog(
        'CANCEL_ORDER',
        blockId,
        `Cancel this ${side} order at ${block.label}?`
      );
    } else if (block.state === BlockState.EXECUTED) {
      // Show square-off confirmation
      const trade = get().trades.find(t => t.blockId === blockId && !t.isSquareOff);
      if (trade) {
        const pnl = trade.side === Side.BUY 
          ? (get().currentPrice - trade.execPrice) * trade.qty
          : (trade.execPrice - get().currentPrice) * trade.qty;
        const pnlStr = pnl >= 0 ? `+₹${pnl.toFixed(2)}` : `-₹${Math.abs(pnl).toFixed(2)}`;
        
        get().openConfirmDialog(
          'SQUARE_OFF',
          blockId,
          `Square off this trade? Current P&L: ${pnlStr}`
        );
      }
    } else if (block.state === BlockState.CANCELLED) {
      // Reset to idle
      get().resetBlock(blockId);
    }
  },
  
  // Arm a block (create order intent)
  armBlock: (blockId) => {
    const { blocks, side, quantity, orders } = get();
    const block = blocks.find(b => b.id === blockId);
    
    if (!block || block.state !== BlockState.IDLE) return;
    
    const now = Date.now();
    
    set({
      blocks: blocks.map(b =>
        b.id === blockId
          ? { ...b, state: BlockState.ARMED, armedAt: now }
          : b
      ),
      orders: [
        ...orders,
        {
          id: generateId(),
          blockId,
          side,
          qty: quantity,
          targetPrice: block.targetPrice,
          state: 'ARMED',
          armedAt: now,
        },
      ],
    });
  },
  
  // Cancel an armed block
  cancelBlock: (blockId) => {
    const { blocks, orders } = get();
    
    set({
      blocks: blocks.map(b =>
        b.id === blockId && b.state === BlockState.ARMED
          ? { ...b, state: BlockState.IDLE, armedAt: undefined }
          : b
      ),
      orders: orders.map(o =>
        o.blockId === blockId && o.state === 'ARMED'
          ? { ...o, state: 'CANCELLED' }
          : o
      ),
    });
  },
  
  // Check if any armed blocks should trigger
  checkTriggers: (currentPrice) => {
    const { blocks, orders, trades } = get();
    const now = Date.now();
    
    const armedOrders = orders.filter(o => o.state === 'ARMED');
    const updatedBlocks = [...blocks];
    const updatedOrders = [...orders];
    const newTrades = [];
    
    armedOrders.forEach(order => {
      const block = blocks.find(b => b.id === order.blockId);
      if (!block) return;
      
      // Trigger condition: price crosses target
      const shouldTrigger = order.side === Side.BUY
        ? currentPrice <= order.targetPrice
        : currentPrice >= order.targetPrice;
      
      if (shouldTrigger) {
        const blockIndex = updatedBlocks.findIndex(b => b.id === order.blockId);
        if (blockIndex !== -1) {
          updatedBlocks[blockIndex] = {
            ...updatedBlocks[blockIndex],
            state: BlockState.EXECUTED,
            triggeredAt: now,
            executedAt: now,
          };
        }
        
        const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
        if (orderIndex !== -1) {
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            state: 'EXECUTED',
            triggeredAt: now,
            executedAt: now,
            execPrice: currentPrice,
          };
        }
        
        newTrades.push({
          id: generateId(),
          ts: now,
          side: order.side,
          qty: order.qty,
          triggerPrice: order.targetPrice,
          execPrice: currentPrice,
          blockId: order.blockId,
        });
      }
    });
    
    if (newTrades.length > 0) {
      set({
        blocks: updatedBlocks,
        orders: updatedOrders,
        trades: [...trades, ...newTrades],
      });
    }
  },
  
  // Reset a single block to idle
  resetBlock: (blockId) => {
    const { blocks } = get();
    set({
      blocks: blocks.map(b =>
        b.id === blockId
          ? { ...b, state: BlockState.IDLE, armedAt: undefined, triggeredAt: undefined, executedAt: undefined }
          : b
      ),
    });
  },
  
  // Reset all blocks
  resetAllBlocks: () => {
    set({ orders: [], trades: [] });
    get().regenerateBlocks(true);
  },
  
  // Update settings
  updateSettings: (newSettings) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  
  // Get armed orders count
  getArmedCount: () => {
    return get().orders.filter(o => o.state === 'ARMED').length;
  },
  
  // Get total P&L
  getTotalPnL: () => {
    const { trades, currentPrice } = get();
    let pnl = 0;
    
    // Group trades by blockId to handle square-offs
    const tradesByBlock = {};
    trades.forEach(trade => {
      if (!tradesByBlock[trade.blockId]) {
        tradesByBlock[trade.blockId] = [];
      }
      tradesByBlock[trade.blockId].push(trade);
    });
    
    // Calculate P&L for each position
    Object.values(tradesByBlock).forEach(blockTrades => {
      const openTrade = blockTrades.find(t => !t.isSquareOff);
      const closeTrade = blockTrades.find(t => t.isSquareOff);
      
      if (openTrade && closeTrade) {
        // Closed position - realized P&L
        if (openTrade.side === Side.BUY) {
          pnl += (closeTrade.execPrice - openTrade.execPrice) * openTrade.qty;
        } else {
          pnl += (openTrade.execPrice - closeTrade.execPrice) * openTrade.qty;
        }
      } else if (openTrade) {
        // Open position - unrealized P&L
        if (openTrade.side === Side.BUY) {
          pnl += (currentPrice - openTrade.execPrice) * openTrade.qty;
        } else {
          pnl += (openTrade.execPrice - currentPrice) * openTrade.qty;
        }
      }
    });
    
    return pnl;
  },
}));

export default useTradingStore;
