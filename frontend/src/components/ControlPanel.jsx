import React from 'react';
import { useTradingStore, Side, BlockState } from '../store/tradingStore';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

const ControlPanel = ({ 
  currentPrice, 
  isRunning, 
  onToggle, 
  onReset,
  volatility,
  onVolatilityChange,
  tickRate,
  onTickRateChange
}) => {
  const { side, quantity, setSide, setQuantity, resetAllBlocks, blocks, orders } = useTradingStore();
  
  const armedCount = orders.filter(o => o.state === 'ARMED').length;
  const executedCount = blocks.filter(b => b.state === BlockState.EXECUTED).length;
  
  return (
    <div className="flex items-center justify-between gap-4 p-3 md:p-4 bg-[#120A14] border-b border-[#3D2840]">
      {/* Left: Current Price */}
      <div className="flex items-center gap-3 md:gap-6">
        <div data-testid="current-price-display">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F555A2]">NIFTY</span>
            {isRunning ? (
              <Zap className="text-[#E0FF66] animate-pulse" size={14} />
            ) : (
              <Pause className="text-[#F555A2]/50" size={14} />
            )}
          </div>
          <span className="text-2xl md:text-4xl font-mono font-bold text-white" style={{ textShadow: '0 0 20px rgba(245, 85, 162, 0.6)' }}>
            ₹{currentPrice.toFixed(2)}
          </span>
        </div>
        
        {/* Stats */}
        <div className="hidden md:flex gap-6 ml-4 text-xs font-mono">
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">Armed</span>
            <span className="text-[#E0FF66] font-bold text-lg">{armedCount}</span>
          </div>
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">Executed</span>
            <span className="text-white font-bold text-lg">{executedCount}</span>
          </div>
        </div>
      </div>
      
      {/* Center: BUY/SELL Toggle + Quantity */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Side Toggle */}
        <div className="flex rounded-full overflow-hidden border border-[#3D2840]" data-testid="side-toggle">
          <button
            className={`px-3 md:px-5 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              side === Side.BUY 
                ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                : 'bg-transparent text-[#F555A2]/60 hover:text-white'
            }`}
            onClick={() => setSide(Side.BUY)}
            data-testid="buy-button"
          >
            <TrendingUp size={12} />
            <span className="hidden md:inline">Buy</span>
          </button>
          <button
            className={`px-3 md:px-5 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              side === Side.SELL 
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-transparent text-[#F555A2]/60 hover:text-white'
            }`}
            onClick={() => setSide(Side.SELL)}
            data-testid="sell-button"
          >
            <TrendingDown size={12} />
            <span className="hidden md:inline">Sell</span>
          </button>
        </div>
        
        {/* Quantity */}
        <div className="flex items-center gap-1 md:gap-2 bg-[#0A0510] rounded-lg px-2 md:px-3 py-1 border border-[#3D2840]">
          <span className="text-[10px] md:text-xs text-[#F555A2]/70">Qty</span>
          <button
            className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#3D2840] text-white hover:bg-[#F555A2]/30 transition-colors text-sm"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
            data-testid="qty-decrease"
          >
            -
          </button>
          <span className="font-mono font-bold text-white w-6 md:w-8 text-center text-sm md:text-base" data-testid="quantity-display">
            {quantity}
          </span>
          <button
            className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#3D2840] text-white hover:bg-[#F555A2]/30 transition-colors text-sm"
            onClick={() => setQuantity(quantity + 1)}
            data-testid="qty-increase"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Right: Controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-8 w-8 md:h-9 md:w-9"
          data-testid="play-pause-button"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        
        {/* Reset */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onReset();
            resetAllBlocks();
          }}
          className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-8 w-8 md:h-9 md:w-9"
          data-testid="reset-button"
        >
          <RotateCcw size={16} />
        </Button>
        
        {/* Settings */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-8 w-8 md:h-9 md:w-9"
              data-testid="settings-button"
            >
              <Settings size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#120A14] border-[#3D2840]">
            <SheetHeader>
              <SheetTitle className="text-white">Simulation Settings</SheetTitle>
              <SheetDescription className="text-[#F555A2]/70">
                Adjust the price simulation parameters
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-8 space-y-8">
              {/* Volatility */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white">Volatility</label>
                  <span className="text-xs font-mono text-[#E0FF66]">
                    {(volatility * 100).toFixed(2)}%
                  </span>
                </div>
                <Slider
                  value={[volatility * 10000]}
                  onValueChange={([v]) => onVolatilityChange(v / 10000)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                  data-testid="volatility-slider"
                />
                <p className="text-xs text-[#F555A2]/60">
                  Higher volatility = bigger price swings
                </p>
              </div>
              
              {/* Tick Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white">Tick Rate</label>
                  <span className="text-xs font-mono text-[#E0FF66]">
                    {tickRate}ms ({(1000 / tickRate).toFixed(0)} Hz)
                  </span>
                </div>
                <Slider
                  value={[tickRate]}
                  onValueChange={([v]) => onTickRateChange(v)}
                  min={20}
                  max={200}
                  step={10}
                  className="w-full"
                  data-testid="tickrate-slider"
                />
                <p className="text-xs text-[#F555A2]/60">
                  Lower = faster updates (more CPU)
                </p>
              </div>
              
              {/* Reset All */}
              <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={() => {
                  onReset();
                  resetAllBlocks();
                }}
                data-testid="reset-all-button"
              >
                <RotateCcw size={14} className="mr-2" />
                Reset Everything
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ControlPanel;
