import React from 'react';
import PriceBlock from './PriceBlock';
import { useTradingStore } from '../store/tradingStore';

const PriceGrid = ({ currentPrice }) => {
  const gridPrices = useTradingStore(state => state.gridPrices);
  const settings = useTradingStore(state => state.settings);
  const side = useTradingStore(state => state.side);
  
  // Calculate optimal columns based on block count
  const blockCount = gridPrices.length;
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
      {gridPrices.map(targetPrice => (
        <PriceBlock 
          key={`block-${settings.gridMode}-${side}-${targetPrice.toFixed(2)}`}
          targetPrice={targetPrice}
          currentPrice={currentPrice}
        />
      ))}
    </div>
  );
};

export default PriceGrid;
