import React from 'react';
import PriceBlock from './PriceBlock';
import { useTradingStore } from '../store/tradingStore';

const PriceGrid = ({ currentPrice }) => {
  const blocks = useTradingStore(state => state.blocks);
  const settings = useTradingStore(state => state.settings);
  
  // Calculate optimal columns based on block count
  const blockCount = blocks.length;
  let cols;
  if (blockCount <= 9) {
    cols = 3;
  } else if (blockCount <= 16) {
    cols = 4;
  } else if (blockCount <= 25) {
    cols = 5;
  } else if (blockCount <= 36) {
    cols = 6;
  } else if (blockCount <= 49) {
    cols = 7;
  } else {
    cols = 8;
  }
  
  return (
    <div 
      className="grid gap-2 p-4 auto-rows-fr"
      style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(80px, 1fr))`,
      }}
      data-testid="price-grid"
    >
      {blocks.map(block => (
        <PriceBlock 
          key={block.id} 
          block={block} 
          currentPrice={currentPrice}
        />
      ))}
    </div>
  );
};

export default PriceGrid;
