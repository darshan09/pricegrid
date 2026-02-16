import React from 'react';
import { useTradingStore, Side } from '../store/tradingStore';
import { ScrollArea } from './ui/scroll-area';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TradeLog = () => {
  const trades = useTradingStore(state => state.trades);
  const currentPrice = useTradingStore(state => state.currentPrice);
  
  // Calculate individual trade P&L
  const getTradesPnL = (trade) => {
    if (trade.side === Side.BUY) {
      return (currentPrice - trade.execPrice) * trade.qty;
    } else {
      return (trade.execPrice - currentPrice) * trade.qty;
    }
  };
  
  // Sort by most recent first
  const sortedTrades = [...trades].reverse();
  
  // Calculate total P&L
  const totalPnL = trades.reduce((sum, trade) => sum + getTradesPnL(trade), 0);
  
  return (
    <div className="bg-dark-card rounded-lg border border-white/10 h-full flex flex-col" data-testid="trade-log">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Trade Log</h3>
          <span className="text-xs font-mono text-muted-foreground">{trades.length} trades</span>
        </div>
        
        {/* Total P&L */}
        {trades.length > 0 && (
          <div className={`mt-2 flex items-center gap-2 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-mono text-sm">
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">unrealized</span>
          </div>
        )}
      </div>
      
      {/* Trade list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No trades yet. Tap a price block to arm it.
            </div>
          ) : (
            sortedTrades.map(trade => {
              const pnl = getTradesPnL(trade);
              const isBuy = trade.side === Side.BUY;
              
              return (
                <div
                  key={trade.id}
                  className="bg-dark-void rounded-md p-3 border border-white/5"
                  data-testid={`trade-${trade.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(trade.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Qty</span>
                      <p className="font-mono text-white">{trade.qty}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target</span>
                      <p className="font-mono text-white">₹{trade.triggerPrice}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exec Price</span>
                      <p className="font-mono text-white">₹{trade.execPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L</span>
                      <p className={`font-mono ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
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
