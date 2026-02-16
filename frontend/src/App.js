import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { useMarketSimulation } from './hooks/useMarketSimulation';
import { useTradingStore } from './store/tradingStore';
import LiveChart from './components/LiveChart';
import PriceGrid from './components/PriceGrid';
import TradeLog from './components/TradeLog';
import ControlPanel from './components/ControlPanel';
import ConfirmDialog from './components/ConfirmDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const INITIAL_PRICE = 2006;

function App() {
  const [volatility, setVolatility] = useState(0.0005);
  const [tickRate, setTickRate] = useState(50);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 180 });
  
  const { 
    currentPrice, 
    priceHistory, 
    isRunning, 
    toggle, 
    reset: resetSimulation 
  } = useMarketSimulation({
    initialPrice: INITIAL_PRICE,
    volatility,
    tickRate,
  });
  
  const { initializeBlocks, updatePrice, trades } = useTradingStore();
  
  // Initialize blocks on mount
  useEffect(() => {
    initializeBlocks(INITIAL_PRICE);
  }, [initializeBlocks]);
  
  // Update store price whenever simulation price changes
  useEffect(() => {
    updatePrice(currentPrice);
  }, [currentPrice, updatePrice]);
  
  // Track trades and show toast on execution
  const [lastTradeCount, setLastTradeCount] = useState(0);
  useEffect(() => {
    if (trades.length > lastTradeCount) {
      const newTrade = trades[trades.length - 1];
      
      if (newTrade.isSquareOff) {
        // Square-off trade
        const originalTrade = trades.find(t => t.id === newTrade.originalTradeId);
        const pnl = originalTrade
          ? (originalTrade.side === 'BUY' 
              ? (newTrade.execPrice - originalTrade.execPrice) * originalTrade.qty
              : (originalTrade.execPrice - newTrade.execPrice) * originalTrade.qty)
          : 0;
        
        toast.success(`Position Squared Off!`, {
          description: `P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}`,
          duration: 4000,
        });
      } else {
        // New trade execution
        toast.success(`${newTrade.side} Order Executed!`, {
          description: `${newTrade.qty} @ ₹${newTrade.execPrice.toFixed(2)}`,
          duration: 3000,
        });
      }
      setLastTradeCount(trades.length);
    }
  }, [trades, lastTradeCount]);
  
  // Handle window resize for chart
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('chart-container');
      if (container) {
        setChartDimensions({
          width: container.offsetWidth - 32,
          height: Math.min(200, Math.max(150, window.innerHeight * 0.2)),
        });
      }
    };
    
    const timeoutId = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleReset = useCallback(() => {
    resetSimulation(INITIAL_PRICE);
    initializeBlocks(INITIAL_PRICE);
    setLastTradeCount(0);
    toast.info('Simulation Reset', { duration: 2000 });
  }, [resetSimulation, initializeBlocks]);
  
  return (
    <div className="min-h-screen bg-[#0A0510] text-white flex flex-col" data-testid="app-container">
      {/* Control Panel (Header) */}
      <ControlPanel
        currentPrice={currentPrice}
        isRunning={isRunning}
        onToggle={toggle}
        onReset={handleReset}
        volatility={volatility}
        onVolatilityChange={setVolatility}
        tickRate={tickRate}
        onTickRateChange={setTickRate}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Main: Grid + Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Price Grid */}
          <div className="flex-1 overflow-auto bg-[#0A0510]">
            <PriceGrid currentPrice={currentPrice} />
          </div>
          
          {/* Live Chart */}
          <div 
            id="chart-container" 
            className="border-t border-[#3D2840] p-4 bg-[#120A14] shrink-0"
            data-testid="chart-section"
          >
            <LiveChart
              priceHistory={priceHistory}
              currentPrice={currentPrice}
              width={chartDimensions.width}
              height={chartDimensions.height}
            />
          </div>
        </div>
        
        {/* Right: Trade Log */}
        <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-[#3D2840] shrink-0">
          <TradeLog />
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog />
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: '#120A14',
            border: '1px solid #3D2840',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
