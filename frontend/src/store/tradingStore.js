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

// Generate price blocks around a base price
const generatePriceBlocks = (basePrice, gridSize = { rows: 6, cols: 8 }) => {
  const blocks = [];
  const priceStep = 2; // ₹2 increments
  const totalBlocks = gridSize.rows * gridSize.cols;
  const midPoint = Math.floor(totalBlocks / 2);
  
  for (let i = 0; i < totalBlocks; i++) {
    // Calculate price offset from center
    const row = Math.floor(i / gridSize.cols);
    const col = i % gridSize.cols;
    
    // Higher prices at top, lower at bottom
    // Left to right: lower to higher within row
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
  
  // Sort by price descending (highest at top-left)
  blocks.sort((a, b) => b.targetPrice - a.targetPrice);
  
  return blocks;
};

export const useTradingStore = create((set, get) => ({
  // Current market state
  basePrice: 2006,
  currentPrice: 2006.16,
  
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
  },
  
  // Initialize blocks
  initializeBlocks: (basePrice) => {
    const { settings } = get();
    set({
      basePrice,
      blocks: generatePriceBlocks(basePrice, settings.gridSize),
    });
  },
  
  // Update current price
  updatePrice: (price) => {
    set({ currentPrice: price });
    // Check for triggers
    get().checkTriggers(price);
  },
  
  // Toggle side (BUY/SELL)
  toggleSide: () => {
    set(state => ({
      side: state.side === Side.BUY ? Side.SELL : Side.BUY,
    }));
  },
  
  // Set side directly
  setSide: (side) => set({ side }),
  
  // Set quantity
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  
  // Arm a block (create order intent)
  armBlock: (blockId) => {
    const { blocks, side, quantity, orders } = get();
    const block = blocks.find(b => b.id === blockId);
    
    if (!block || block.state !== BlockState.IDLE) return;
    
    const now = Date.now();
    
    // Update block state
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
    const { blocks, orders, trades, side } = get();
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
        // Update block
        const blockIndex = updatedBlocks.findIndex(b => b.id === order.blockId);
        if (blockIndex !== -1) {
          updatedBlocks[blockIndex] = {
            ...updatedBlocks[blockIndex],
            state: BlockState.EXECUTED,
            triggeredAt: now,
            executedAt: now,
          };
        }
        
        // Update order
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
        
        // Create trade
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
    const { basePrice, settings } = get();
    set({
      blocks: generatePriceBlocks(basePrice, settings.gridSize),
      orders: [],
      trades: [],
    });
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
  
  // Get total P&L (simplified)
  getTotalPnL: () => {
    const { trades, currentPrice } = get();
    let pnl = 0;
    
    trades.forEach(trade => {
      if (trade.side === Side.BUY) {
        // Bought at execPrice, current value is currentPrice
        pnl += (currentPrice - trade.execPrice) * trade.qty;
      } else {
        // Sold at execPrice
        pnl += (trade.execPrice - currentPrice) * trade.qty;
      }
    });
    
    return pnl;
  },
}));

export default useTradingStore;
