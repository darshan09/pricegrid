import React from 'react';
import { useTradingStore, Side } from '../store/tradingStore';
import { ScrollArea } from './ui/scroll-area';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';

const TradeLog = () => {
  const trades = useTradingStore(state => state.trades);
  const currentPrice = useTradingStore(state => state.currentPrice);
  const getTotalPnL = useTradingStore(state => state.getTotalPnL);
  
  // Sort by most recent first
  const sortedTrades = [...trades].reverse();
  
  // Calculate total P&L using the store method
  const totalPnL = getTotalPnL();
  
  // Count open vs closed positions
  const openPositions = trades.filter(t => !t.isSquareOff).length - trades.filter(t => t.isSquareOff).length;
  
  return (
    <div className="bg-[#120A14] h-full flex flex-col" data-testid="trade-log">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-[#3D2840]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-semibold text-[#F555A2] uppercase tracking-wider">Trade Log</h3>
          <div className="flex gap-2 text-[10px] md:text-xs font-mono">
            <span className="text-[#F555A2]/60">{trades.length} trades</span>
            {openPositions > 0 && (
              <span className="text-[#E0FF66]">{openPositions} open</span>
            )}
          </div>
        </div>
        
        {/* Total P&L */}
        {trades.length > 0 && (
          <div className={`mt-2 flex items-center gap-2 ${totalPnL >= 0 ? 'text-[#E0FF66]' : 'text-red-400'}`}>
            {totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-mono text-sm md:text-base font-bold">
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#F555A2]/50">
              {openPositions > 0 ? 'unrealized' : 'realized'}
            </span>
          </div>
        )}
      </div>
      
      {/* Trade list */}
      <ScrollArea className="flex-1">
        <div className="p-2 md:p-3 space-y-2">
          {sortedTrades.length === 0 ? (
            <div className="text-center py-8 text-[#F555A2]/50 text-xs md:text-sm">
              No trades yet. Tap a price block to arm it.
            </div>
          ) : (
            sortedTrades.map(trade => {
              const isBuy = trade.side === Side.BUY;
              const isSquareOff = trade.isSquareOff;
              
              // Calculate P&L for this specific trade
              let pnl = 0;
              if (isSquareOff) {
                const originalTrade = trades.find(t => t.id === trade.originalTradeId);
                if (originalTrade) {
                  pnl = originalTrade.side === Side.BUY
                    ? (trade.execPrice - originalTrade.execPrice) * originalTrade.qty
                    : (originalTrade.execPrice - trade.execPrice) * originalTrade.qty;
                }
              } else {
                // Open position - unrealized P&L
                pnl = trade.side === Side.BUY
                  ? (currentPrice - trade.execPrice) * trade.qty
                  : (trade.execPrice - currentPrice) * trade.qty;
              }
              
              return (
                <div
                  key={trade.id}
                  className={`rounded-md p-2 md:p-3 border ${
                    isSquareOff 
                      ? 'bg-[#0A0510]/50 border-[#3D2840]/50'
                      : 'bg-[#0A0510] border-[#3D2840]'
                  }`}
                  data-testid={`trade-${trade.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isSquareOff ? (
                        <span className="text-[10px] md:text-xs font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <ArrowLeftRight size={10} />
                          SQUARE OFF
                        </span>
                      ) : (
                        <span className={`text-[10px] md:text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.side}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-mono text-[#F555A2]/50">
                      {new Date(trade.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                    <div>
                      <span className="text-[#F555A2]/50">Qty</span>
                      <p className="font-mono text-white">{trade.qty}</p>
                    </div>
                    <div>
                      <span className="text-[#F555A2]/50">{isSquareOff ? 'Exit' : 'Target'}</span>
                      <p className="font-mono text-white">₹{trade.triggerPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[#F555A2]/50">Exec Price</span>
                      <p className="font-mono text-white">₹{trade.execPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[#F555A2]/50">P&L</span>
                      <p className={`font-mono font-bold ${pnl >= 0 ? 'text-[#E0FF66]' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                        {!isSquareOff && <span className="text-[8px] ml-1 opacity-50">live</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TradeLog;
