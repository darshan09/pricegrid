import React from 'react';
import { motion } from 'framer-motion';
import { BlockState, useTradingStore } from '../store/tradingStore';
import { X } from 'lucide-react';

const PriceBlock = ({ block, currentPrice }) => {
  const { armBlock, cancelBlock, resetBlock, side } = useTradingStore();
  
  const { id, label, targetPrice, state } = block;
  
  // Determine if price is above or below target
  const priceAbove = currentPrice > targetPrice;
  const priceDiff = Math.abs(currentPrice - targetPrice).toFixed(2);
  
  // State-based styles
  const getStateStyles = () => {
    switch (state) {
      case BlockState.ARMED:
        return 'border-neon-lime/80 bg-neon-lime/10 animate-pulse-glow';
      case BlockState.TRIGGERED:
        return 'border-neon-lime bg-neon-lime/50 animate-flash-trigger';
      case BlockState.EXECUTED:
        return 'border-neon-lime bg-neon-lime text-black scale-105 z-10 glow-lime';
      case BlockState.CANCELLED:
        return 'border-red-500/50 bg-red-500/10 opacity-50';
      default:
        return 'border-white/10 bg-dark-card hover:bg-white/5 hover:border-white/20';
    }
  };
  
  const handleClick = () => {
    if (state === BlockState.IDLE) {
      armBlock(id);
    } else if (state === BlockState.EXECUTED || state === BlockState.CANCELLED) {
      resetBlock(id);
    }
  };
  
  const handleCancel = (e) => {
    e.stopPropagation();
    cancelBlock(id);
  };
  
  return (
    <motion.div
      className={`
        relative aspect-square rounded-md border flex flex-col items-center justify-center 
        transition-all duration-100 cursor-pointer select-none
        ${getStateStyles()}
      `}
      onClick={handleClick}
      whileHover={{ scale: state === BlockState.IDLE ? 1.02 : 1 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`price-block-${targetPrice}`}
      data-state={state}
    >
      {/* Cancel button for armed blocks */}
      {state === BlockState.ARMED && (
        <button
          onClick={handleCancel}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-20"
          data-testid={`cancel-block-${targetPrice}`}
        >
          <X size={12} />
        </button>
      )}
      
      {/* Main price label */}
      <span className={`text-lg font-mono font-bold ${state === BlockState.EXECUTED ? 'text-black' : 'text-white'}`}>
        {label}
      </span>
      
      {/* Distance indicator */}
      <span className={`text-xs font-mono mt-1 ${
        state === BlockState.EXECUTED 
          ? 'text-black/70' 
          : priceAbove ? 'text-red-400' : 'text-green-400'
      }`}>
        {priceAbove ? '↓' : '↑'} ₹{priceDiff}
      </span>
      
      {/* State indicator */}
      {state === BlockState.ARMED && (
        <span className="absolute bottom-1 text-[9px] font-mono uppercase tracking-wider text-neon-lime">
          Armed
        </span>
      )}
      {state === BlockState.EXECUTED && (
        <span className="absolute bottom-1 text-[9px] font-mono uppercase tracking-wider text-black/70">
          Executed
        </span>
      )}
    </motion.div>
  );
};

export default PriceBlock;
