import React from 'react';
import { useTradingStore, Side, GridMode } from '../store/tradingStore';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Zap,
  Layers,
  BarChart3,
  Activity,
  RefreshCw,
  Ban,
  DollarSign
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
  const { 
    side, 
    quantity, 
    setSide, 
    setQuantity, 
    resetAll, 
    settings,
    setGridMode,
    setLevelsPerSide,
    setTickSize,
    setAutoRecalc,
    marketSnapshot,
    regenerateGrid,
    getArmedCount,
    getExecutedCount,
    showCancelAllDialog,
    showSquareOffAllDialog,
    getTotalPnL
  } = useTradingStore();
  
  const armedCount = getArmedCount();
  const executedCount = getExecutedCount();
  const totalPnL = getTotalPnL();
  
  // Get mode display name
  const getModeDisplay = () => {
    switch (settings.gridMode) {
      case GridMode.DEPTH_LADDER: return 'DEPTH';
      case GridMode.LIQUIDITY_LADDER: return 'LIQ';
      default: return 'LTP';
    }
  };
  
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 p-2 md:p-4 bg-[#120A14] border-b border-[#3D2840]">
      {/* Left: Current Price + Market Data */}
      <div className="flex items-center gap-2 md:gap-6">
        <div data-testid="current-price-display">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F555A2]">NIFTY</span>
            {isRunning ? (
              <Zap className="text-[#E0FF66] animate-pulse" size={14} />
            ) : (
              <Pause className="text-[#F555A2]/50" size={14} />
            )}
          </div>
          <span className="text-xl md:text-3xl font-mono font-bold text-white" style={{ textShadow: '0 0 20px rgba(245, 85, 162, 0.6)' }}>
            ₹{currentPrice.toFixed(2)}
          </span>
          {/* Bid/Ask display */}
          <div className="hidden md:flex gap-2 text-[9px] md:text-[10px] font-mono mt-0.5">
            <span className="text-green-400">B: ₹{marketSnapshot.bestBid?.toFixed(2)}</span>
            <span className="text-red-400">A: ₹{marketSnapshot.bestAsk?.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="hidden lg:flex gap-4 ml-2 text-xs font-mono">
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">Armed</span>
            <span className="text-[#E0FF66] font-bold text-lg">{armedCount}</span>
          </div>
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">Open</span>
            <span className="text-white font-bold text-lg">{executedCount}</span>
          </div>
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">P&L</span>
            <span className={`font-bold text-sm ${totalPnL >= 0 ? 'text-[#E0FF66]' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[#F555A2]/70 block uppercase tracking-wider text-[10px]">Mode</span>
            <span className={`font-bold text-xs ${
              settings.gridMode === GridMode.LIQUIDITY_LADDER ? 'text-blue-400' :
              settings.gridMode === GridMode.DEPTH_LADDER ? 'text-[#F555A2]' : 'text-[#E0FF66]'
            }`}>
              {getModeDisplay()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Center: BUY/SELL Toggle + Quantity + Bulk Actions */}
      <div className="flex items-center gap-1 md:gap-3">
        {/* Side Toggle */}
        <div className="flex rounded-full overflow-hidden border border-[#3D2840]" data-testid="side-toggle">
          <button
            className={`px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
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
            className={`px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
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
        <div className="flex items-center gap-1 bg-[#0A0510] rounded-lg px-2 py-1 border border-[#3D2840]">
          <span className="text-[10px] text-[#F555A2]/70 hidden md:inline">Qty</span>
          <button
            className="w-5 h-5 rounded bg-[#3D2840] text-white hover:bg-[#F555A2]/30 transition-colors text-sm"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
            data-testid="qty-decrease"
          >
            -
          </button>
          <span className="font-mono font-bold text-white w-6 text-center text-sm" data-testid="quantity-display">
            {quantity}
          </span>
          <button
            className="w-5 h-5 rounded bg-[#3D2840] text-white hover:bg-[#F555A2]/30 transition-colors text-sm"
            onClick={() => setQuantity(quantity + 1)}
            data-testid="qty-increase"
          >
            +
          </button>
        </div>
        
        {/* Bulk Action Buttons */}
        <div className="flex gap-1">
          {/* Cancel All Armed */}
          {armedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={showCancelAllDialog}
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 text-[10px] px-2 h-8"
              data-testid="cancel-all-button"
            >
              <Ban size={12} className="mr-1" />
              <span className="hidden md:inline">Cancel All</span>
              <span className="md:hidden">×{armedCount}</span>
            </Button>
          )}
          
          {/* Square Off All */}
          {executedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={showSquareOffAllDialog}
              className="border-[#E0FF66]/50 text-[#E0FF66] hover:bg-[#E0FF66]/20 hover:border-[#E0FF66] text-[10px] px-2 h-8"
              data-testid="square-off-all-button"
            >
              <DollarSign size={12} className="mr-1" />
              <span className="hidden md:inline">Exit All</span>
              <span className="md:hidden">₹{executedCount}</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Manual Recalc */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => regenerateGrid(true)}
          className="border-[#3D2840] hover:bg-[#E0FF66]/20 hover:border-[#E0FF66] h-7 w-7 md:h-8 md:w-8"
          title="Recalculate Grid"
          data-testid="recalc-button"
        >
          <RefreshCw size={14} />
        </Button>
        
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-7 w-7 md:h-8 md:w-8"
          data-testid="play-pause-button"
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        
        {/* Reset */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onReset();
            resetAll();
          }}
          className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-7 w-7 md:h-8 md:w-8"
          data-testid="reset-button"
        >
          <RotateCcw size={14} />
        </Button>
        
        {/* Settings */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-[#3D2840] hover:bg-[#F555A2]/20 hover:border-[#F555A2] h-7 w-7 md:h-8 md:w-8"
              data-testid="settings-button"
            >
              <Settings size={14} />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#120A14] border-[#3D2840] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">Settings</SheetTitle>
              <SheetDescription className="text-[#F555A2]/70">
                Configure simulation and grid parameters
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* GRID CONFIGURATION SECTION */}
              <div className="space-y-4 p-4 bg-[#0A0510] rounded-lg border border-[#3D2840]">
                <h4 className="text-sm font-semibold text-[#E0FF66] flex items-center gap-2">
                  <Layers size={14} />
                  Grid Configuration
                </h4>
                
                {/* Grid Mode Toggle */}
                <div className="space-y-2">
                  <label className="text-xs text-white">Ladder Mode</label>
                  <Select
                    value={settings.gridMode}
                    onValueChange={(value) => setGridMode(value)}
                  >
                    <SelectTrigger className="bg-[#120A14] border-[#3D2840] text-white" data-testid="grid-mode-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#120A14] border-[#3D2840]">
                      <SelectItem value={GridMode.LTP_LADDER} className="text-white hover:bg-[#3D2840]">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-[#E0FF66]" />
                          <span>LTP Ladder</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={GridMode.DEPTH_LADDER} className="text-white hover:bg-[#3D2840]">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-[#F555A2]" />
                          <span>Depth Ladder</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={GridMode.LIQUIDITY_LADDER} className="text-white hover:bg-[#3D2840]">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-blue-400" />
                          <span>Liquidity Ladder</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Auto Recalc Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs text-white">Auto Recalculate</label>
                    <p className="text-[10px] text-[#F555A2]/50">Update grid when price moves</p>
                  </div>
                  <Switch
                    checked={settings.autoRecalc}
                    onCheckedChange={setAutoRecalc}
                    data-testid="auto-recalc-switch"
                  />
                </div>
                
                {/* Levels Per Side */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Levels Per Side</label>
                    <span className="text-xs font-mono text-[#E0FF66]">{settings.levelsPerSide}</span>
                  </div>
                  <Slider
                    value={[settings.levelsPerSide]}
                    onValueChange={([v]) => setLevelsPerSide(v)}
                    min={5}
                    max={25}
                    step={1}
                    className="w-full"
                    data-testid="levels-slider"
                  />
                </div>
                
                {/* Tick Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Tick Size</label>
                    <span className="text-xs font-mono text-[#E0FF66]">₹{settings.tickSize.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.tickSize * 100]}
                    onValueChange={([v]) => setTickSize(v / 100)}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="tick-size-slider"
                  />
                </div>
              </div>
              
              {/* SIMULATION SECTION */}
              <div className="space-y-4 p-4 bg-[#0A0510] rounded-lg border border-[#3D2840]">
                <h4 className="text-sm font-semibold text-[#F555A2] flex items-center gap-2">
                  <Zap size={14} />
                  Simulation
                </h4>
                
                {/* Volatility */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Volatility</label>
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
                </div>
                
                {/* Tick Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Tick Rate</label>
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
                </div>
              </div>
              
              {/* Reset All */}
              <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={() => {
                  onReset();
                  resetAll();
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
