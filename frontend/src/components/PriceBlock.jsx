import React from 'react';
import { motion } from 'framer-motion';
import { BlockState, useTradingStore } from '../store/tradingStore';
import { X } from 'lucide-react';

const PriceBlock = ({ block, currentPrice }) => {
  const { armBlock, cancelBlock, resetBlock } = useTradingStore();
  
  const { id, label, targetPrice, state } = block;
  
  // Determine if price is above or below target
  const priceAbove = currentPrice > targetPrice;
  const priceDiff = Math.abs(currentPrice - targetPrice).toFixed(2);
  
  // State-based styles
  const getStateStyles = () => {
    switch (state) {
      case BlockState.ARMED:
        return 'border-[#E0FF66] bg-[#E0FF66]/20 shadow-[0_0_20px_rgba(224,255,102,0.4),inset_0_0_20px_rgba(224,255,102,0.1)]';
      case BlockState.TRIGGERED:
        return 'border-[#E0FF66] bg-[#E0FF66]/60 shadow-[0_0_30px_rgba(224,255,102,0.7)]';
      case BlockState.EXECUTED:
        return 'border-[#E0FF66] bg-[#E0FF66] text-black shadow-[0_0_30px_rgba(224,255,102,0.8)] scale-105 z-10';
      case BlockState.CANCELLED:
        return 'border-red-500/50 bg-red-500/10 opacity-50';
      default:
        return 'border-[#3D2840] bg-[#120A14] hover:bg-[#1A0F1C] hover:border-[#F555A2]/40';
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
  
  const isArmed = state === BlockState.ARMED;
  const isExecuted = state === BlockState.EXECUTED;
  
  return (
    <motion.div
      className={`
        relative aspect-square rounded-md border-2 flex flex-col items-center justify-center 
        cursor-pointer select-none transition-colors duration-150
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
      <span className={`text-base md:text-lg font-mono font-bold tracking-tight ${isExecuted ? 'text-black' : 'text-white'}`}>
        {label}
      </span>
      
      {/* Distance indicator */}
      <span className={`text-[10px] md:text-xs font-mono mt-0.5 ${
        isExecuted 
          ? 'text-black/70' 
          : priceAbove ? 'text-[#F555A2]' : 'text-[#E0FF66]'
      }`}>
        {priceAbove ? '↓' : '↑'} ₹{priceDiff}
      </span>
      
      {/* State indicator */}
      {isArmed && (
        <motion.span 
          className="absolute bottom-1 text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-[#E0FF66]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ARMED
        </motion.span>
      )}
      {isExecuted && (
        <span className="absolute bottom-1 text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-black/80">
          EXECUTED
        </span>
      )}
    </motion.div>
  );
};

export default PriceBlock;
