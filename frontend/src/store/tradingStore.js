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
};

// ============ UTILITY FUNCTIONS ============

// Round to tick size
function roundToTick(price, tick) {
  return Math.round(price / tick) * tick;
}

// Clamp to positive
function safePrice(price) {
  return Math.max(price, 0);
}

// ============ OPTION A: LTP-Based Tick Ladder ============
function generateLtpLadder(snapshot, config) {
  const { ltp, bestBid, bestAsk, tickSize } = snapshot;
  const { levelsPerSide } = config;

  // Mid price calculation
  const mid = bestBid && bestAsk
    ? (bestBid + bestAsk) / 2
    : ltp;

  // Step calculation (spread-aware)
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

  // Remove duplicates and sort descending
  return [...new Set(prices)].sort((a, b) => b - a);
}

// ============ OPTION B: Market Depth Anchored Ladder ============
function generateDepthLadder(snapshot, config, side) {
  const { bestBid, bestAsk, tickSize, ltp } = snapshot;
  const { levelsPerSide } = config;

  // Fallback to LTP if no depth
  if (!bestBid || !bestAsk) {
    console.warn("No depth data, falling back to LTP ladder");
    return generateLtpLadder(snapshot, config);
  }

  // Anchor based on side
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

  // Remove duplicates and sort descending
  return [...new Set(prices)].sort((a, b) => b - a);
}

// Generate price blocks from prices array
const generateBlocksFromPrices = (prices, currentLtp) => {
  return prices.map(targetPrice => ({
    id: generateId(),
    label: `₹${targetPrice.toLocaleString('en-IN')}`,
    targetPrice,
    state: BlockState.IDLE,
    createdAt: Date.now(),
  }));
};

// Legacy grid generation (for backwards compatibility)
const generatePriceBlocks = (basePrice, gridSize = { rows: 6, cols: 8 }) => {
  const blocks = [];
  const priceStep = 2;
  const totalBlocks = gridSize.rows * gridSize.cols;
  
  for (let i = 0; i < totalBlocks; i++) {
    const row = Math.floor(i / gridSize.cols);
    const col = i % gridSize.cols;
    
    const rowOffset = (gridSize.rows - 1 - row) * priceStep * gridSize.cols / 2;
    const colOffset = (col - gridSize.cols / 2) * priceStep;
    
    const targetPrice = Math.round(basePrice + rowOffset + colOffset);
    
    blocks.push({
      id: generateId(),
      label: `₹${targetPrice.toLocaleString('en-IN')}`,
      targetPrice,
      state: BlockState.IDLE,
      createdAt: Date.now(),
    });
  }
  
  blocks.sort((a, b) => b.targetPrice - a.targetPrice);
  return blocks;
};

export const useTradingStore = create((set, get) => ({
  // Current market state
  basePrice: 2006,
  currentPrice: 2006.16,
  
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
  
  // Settings
  settings: {
    volatility: 0.0005,
    tickRate: 50,
    gridSize: { rows: 6, cols: 8 },
    gridMode: GridMode.LTP_LADDER,
    levelsPerSide: 12,
    tickSize: 0.05,
  },
  
  // Update market snapshot
  updateMarketSnapshot: (snapshot) => {
    set({ marketSnapshot: { ...get().marketSnapshot, ...snapshot } });
  },
  
  // Regenerate blocks based on current mode
  regenerateBlocks: () => {
    const { marketSnapshot, settings, side } = get();
    const { gridMode, levelsPerSide, tickSize } = settings;
    
    const config = { levelsPerSide };
    const snapshotWithTick = { ...marketSnapshot, tickSize };
    
    let prices;
    if (gridMode === GridMode.DEPTH_LADDER) {
      prices = generateDepthLadder(snapshotWithTick, config, side);
    } else {
      prices = generateLtpLadder(snapshotWithTick, config);
    }
    
    const blocks = generateBlocksFromPrices(prices, marketSnapshot.ltp);
    
    set({ blocks, orders: [], trades: [] });
  },
  
  // Initialize blocks
  initializeBlocks: (basePrice) => {
    const { settings, side } = get();
    const { gridMode, levelsPerSide, tickSize } = settings;
    
    // Create initial market snapshot
    const spread = tickSize * 5;
    const snapshot = {
      ltp: basePrice,
      bestBid: basePrice - spread / 2,
      bestAsk: basePrice + spread / 2,
      tickSize,
      bids: [],
      asks: [],
    };
    
    const config = { levelsPerSide };
    
    let prices;
    if (gridMode === GridMode.DEPTH_LADDER) {
      prices = generateDepthLadder(snapshot, config, side);
    } else {
      prices = generateLtpLadder(snapshot, config);
    }
    
    const blocks = generateBlocksFromPrices(prices, basePrice);
    
    set({
      basePrice,
      marketSnapshot: snapshot,
      blocks,
      orders: [],
      trades: [],
    });
  },
  
  // Update current price (and simulate depth)
  updatePrice: (price) => {
    const { settings } = get();
    const { tickSize } = settings;
    
    // Simulate spread (random 1-10 ticks)
    const spreadTicks = Math.floor(Math.random() * 10) + 1;
    const spread = spreadTicks * tickSize;
    
    const bestBid = roundToTick(price - spread / 2, tickSize);
    const bestAsk = roundToTick(price + spread / 2, tickSize);
    
    set({ 
      currentPrice: price,
      marketSnapshot: {
        ...get().marketSnapshot,
        ltp: price,
        bestBid,
        bestAsk,
      }
    });
    
    // Check for triggers
    get().checkTriggers(price);
  },
  
  // Toggle side (BUY/SELL)
  toggleSide: () => {
    set(state => ({
      side: state.side === Side.BUY ? Side.SELL : Side.BUY,
    }));
    // Regenerate blocks if in DEPTH_LADDER mode
    const { settings } = get();
    if (settings.gridMode === GridMode.DEPTH_LADDER) {
      get().regenerateBlocks();
    }
  },
  
  // Set side directly
  setSide: (side) => {
    set({ side });
    // Regenerate blocks if in DEPTH_LADDER mode
    const { settings } = get();
    if (settings.gridMode === GridMode.DEPTH_LADDER) {
      get().regenerateBlocks();
    }
  },
  
  // Set quantity
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  
  // Set grid mode
  setGridMode: (mode) => {
    set(state => ({
      settings: { ...state.settings, gridMode: mode }
    }));
    get().regenerateBlocks();
  },
  
  // Set levels per side
  setLevelsPerSide: (levels) => {
    set(state => ({
      settings: { ...state.settings, levelsPerSide: levels }
    }));
    get().regenerateBlocks();
  },
  
  // Set tick size
  setTickSize: (tickSize) => {
    set(state => ({
      settings: { ...state.settings, tickSize },
      marketSnapshot: { ...state.marketSnapshot, tickSize }
    }));
    get().regenerateBlocks();
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
          ? { ...b, state: BlockState.CANCELLED }
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
      // For BUY: trigger when price <= target (buying at or below target)
      // For SELL: trigger when price >= target (selling at or above target)
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
    get().regenerateBlocks();
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
    
    trades.forEach(trade => {
      if (trade.side === Side.BUY) {
        pnl += (currentPrice - trade.execPrice) * trade.qty;
      } else {
        pnl += (trade.execPrice - currentPrice) * trade.qty;
      }
    });
    
    return pnl;
  },
}));

export default useTradingStore;
