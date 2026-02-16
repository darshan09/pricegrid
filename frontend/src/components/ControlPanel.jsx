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
    <div className="flex items-center justify-between gap-4 p-4 bg-dark-card border-b border-white/10">
      {/* Left: Current Price */}
      <div className="flex items-center gap-4">
        <div data-testid="current-price-display">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">NIFTY</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl font-mono font-bold text-white text-glow-pink">
              ₹{currentPrice.toFixed(2)}
            </span>
            {isRunning ? (
              <Zap className="text-neon-lime animate-pulse" size={20} />
            ) : (
              <Pause className="text-muted-foreground" size={20} />
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="hidden md:flex gap-4 ml-4 text-xs font-mono">
          <div className="text-center">
            <span className="text-muted-foreground block">Armed</span>
            <span className="text-neon-lime font-bold">{armedCount}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground block">Executed</span>
            <span className="text-white font-bold">{executedCount}</span>
          </div>
        </div>
      </div>
      
      {/* Center: BUY/SELL Toggle + Quantity */}
      <div className="flex items-center gap-4">
        {/* Side Toggle */}
        <div className="flex rounded-full border border-white/20 overflow-hidden" data-testid="side-toggle">
          <button
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              side === Side.BUY 
                ? 'bg-green-500 text-white' 
                : 'bg-transparent text-muted-foreground hover:text-white'
            }`}
            onClick={() => setSide(Side.BUY)}
            data-testid="buy-button"
          >
            <TrendingUp size={14} className="inline mr-1" />
            Buy
          </button>
          <button
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              side === Side.SELL 
                ? 'bg-red-500 text-white' 
                : 'bg-transparent text-muted-foreground hover:text-white'
            }`}
            onClick={() => setSide(Side.SELL)}
            data-testid="sell-button"
          >
            <TrendingDown size={14} className="inline mr-1" />
            Sell
          </button>
        </div>
        
        {/* Quantity */}
        <div className="flex items-center gap-2 bg-dark-void rounded-lg px-3 py-1 border border-white/10">
          <span className="text-xs text-muted-foreground">Qty</span>
          <button
            className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
            data-testid="qty-decrease"
          >
            -
          </button>
          <span className="font-mono font-bold text-white w-8 text-center" data-testid="quantity-display">
            {quantity}
          </span>
          <button
            className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setQuantity(quantity + 1)}
            data-testid="qty-increase"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="border-white/20 hover:bg-white/10"
          data-testid="play-pause-button"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        
        {/* Reset */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onReset();
            resetAllBlocks();
          }}
          className="border-white/20 hover:bg-white/10"
          data-testid="reset-button"
        >
          <RotateCcw size={18} />
        </Button>
        
        {/* Settings */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 hover:bg-white/10"
              data-testid="settings-button"
            >
              <Settings size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-dark-card border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Simulation Settings</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Adjust the price simulation parameters
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-8 space-y-8">
              {/* Volatility */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white">Volatility</label>
                  <span className="text-xs font-mono text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
                  Higher volatility = bigger price swings
                </p>
              </div>
              
              {/* Tick Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white">Tick Rate</label>
                  <span className="text-xs font-mono text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
                  Lower = faster updates (more CPU)
                </p>
              </div>
              
              {/* Reset All */}
              <Button
                variant="destructive"
                className="w-full"
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
