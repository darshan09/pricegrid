import React from 'react';
import { motion } from 'framer-motion';
import { BlockState, useTradingStore, Side } from '../store/tradingStore';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const PriceBlock = ({ targetPrice, currentPrice }) => {
  const { 
    handleBlockClick, 
    cancelAtPrice, 
    side, 
    getBlockState,
    getTradeForPrice,
    settings 
  } = useTradingStore();
  
  // Get state from store (derived from armedOrders and trades)
  const state = getBlockState(targetPrice);
  const trade = state === BlockState.EXECUTED ? getTradeForPrice(targetPrice) : null;
  
  // Calculate delta and percentage
  const delta = targetPrice - currentPrice;
  const deltaAbs = Math.abs(delta);
  const percentChange = ((targetPrice - currentPrice) / currentPrice) * 100;
  const isPositive = delta >= 0;
  
  // Calculate trade P&L for executed blocks
  let tradePnL = null;
  if (trade) {
    tradePnL = trade.side === Side.BUY 
      ? (currentPrice - trade.execPrice) * trade.qty
      : (trade.execPrice - currentPrice) * trade.qty;
  }
  
  // Deterministic block ID for React key
  const blockId = `block-${settings.gridMode}-${side}-${targetPrice.toFixed(2)}`;
  
  // State-based styles
  const getStateStyles = () => {
    switch (state) {
      case BlockState.ARMED:
        return 'border-[#E0FF66] bg-[#E0FF66]/20 shadow-[0_0_20px_rgba(224,255,102,0.4),inset_0_0_20px_rgba(224,255,102,0.1)]';
      case BlockState.EXECUTED:
        return tradePnL !== null && tradePnL >= 0
          ? 'border-green-400 bg-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
          : 'border-red-400 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
      default:
        return 'border-[#3D2840] bg-[#120A14] hover:bg-[#1A0F1C] hover:border-[#F555A2]/40';
    }
  };
  
  const handleClick = () => {
    handleBlockClick(targetPrice);
  };
  
  const handleCancel = (e) => {
    e.stopPropagation();
    cancelAtPrice(targetPrice);
  };
  
  const isArmed = state === BlockState.ARMED;
  const isExecuted = state === BlockState.EXECUTED;
  
  return (
    <motion.div
      key={blockId}
      className={`
        relative aspect-square rounded-md border-2 flex flex-col items-center justify-center 
        cursor-pointer select-none transition-colors duration-150 p-1
        ${getStateStyles()}
      `}
      onClick={handleClick}
      whileHover={{ scale: state === BlockState.IDLE ? 1.03 : 1 }}
      whileTap={{ scale: 0.97 }}
      animate={isArmed ? { 
        boxShadow: [
          '0 0 15px rgba(224,255,102,0.3), inset 0 0 15px rgba(224,255,102,0.05)',
          '0 0 25px rgba(224,255,102,0.5), inset 0 0 25px rgba(224,255,102,0.1)',
          '0 0 15px rgba(224,255,102,0.3), inset 0 0 15px rgba(224,255,102,0.05)',
        ]
      } : {}}
      transition={isArmed ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
      data-testid={`price-block-${targetPrice}`}
      data-state={state}
    >
      {/* Cancel button for armed blocks */}
      {isArmed && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleCancel}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-20 shadow-lg"
          data-testid={`cancel-block-${targetPrice}`}
        >
          <X size={14} />
        </motion.button>
      )}
      
      {/* Main price label */}
      <span className={`text-sm md:text-base font-mono font-bold tracking-tight ${
        isExecuted ? (tradePnL >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white'
      }`}>
        ₹{targetPrice.toLocaleString('en-IN')}
      </span>
      
      {/* Delta display */}
      <div className={`flex items-center gap-0.5 text-[9px] md:text-[10px] font-mono mt-0.5 ${
        isExecuted 
          ? (tradePnL >= 0 ? 'text-green-400/80' : 'text-red-400/80')
          : isPositive ? 'text-[#E0FF66]' : 'text-[#F555A2]'
      }`}>
        {isPositive ? (
          <TrendingUp size={10} />
        ) : (
          <TrendingDown size={10} />
        )}
        <span>₹{deltaAbs.toFixed(2)}</span>
      </div>
      
      {/* Percentage change */}
      <span className={`text-[8px] font-mono ${
        isExecuted 
          ? (tradePnL >= 0 ? 'text-green-400/60' : 'text-red-400/60')
          : isPositive ? 'text-[#E0FF66]/60' : 'text-[#F555A2]/60'
      }`}>
        {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
      </span>
      
      {/* State indicator */}
      {isArmed && (
        <motion.span 
          className="absolute bottom-0.5 text-[7px] md:text-[8px] font-mono uppercase tracking-widest text-[#E0FF66]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ARMED
        </motion.span>
      )}
      {isExecuted && tradePnL !== null && (
        <span className={`absolute bottom-0.5 text-[7px] md:text-[8px] font-mono font-bold ${
          tradePnL >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {tradePnL >= 0 ? '+' : ''}₹{tradePnL.toFixed(2)}
        </span>
      )}
    </motion.div>
  );
};

export default PriceBlock;
