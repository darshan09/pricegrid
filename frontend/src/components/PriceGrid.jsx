import React from 'react';
import PriceBlock from './PriceBlock';
import { useTradingStore } from '../store/tradingStore';

const PriceGrid = ({ currentPrice }) => {
  const blocks = useTradingStore(state => state.blocks);
  const settings = useTradingStore(state => state.settings);
  
  const { cols } = settings.gridSize;
  
  return (
    <div 
      className="grid gap-2 p-4"
      style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
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
