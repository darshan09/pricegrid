import { useState, useEffect, useRef, useCallback } from 'react';

// Random walk price simulation with occasional spikes
export function useMarketSimulation(options = {}) {
  const {
    initialPrice = 2006.16,
    volatility = 0.0005,
    tickRate = 50, // ms between price updates (20 Hz)
    spikeChance = 0.02,
    spikeMultiplier = 3,
  } = options;

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceHistory, setPriceHistory] = useState([{ t: Date.now(), price: initialPrice }]);
  const [isRunning, setIsRunning] = useState(true);
  
  const priceRef = useRef(currentPrice);
  const historyRef = useRef(priceHistory);
  
  // Keep refs in sync
  useEffect(() => {
    priceRef.current = currentPrice;
  }, [currentPrice]);
  
  useEffect(() => {
    historyRef.current = priceHistory;
  }, [priceHistory]);

  const generateNextPrice = useCallback(() => {
    const lastPrice = priceRef.current;
    
    // Random walk component
    let change = (Math.random() - 0.5) * 2 * volatility * lastPrice;
    
    // Occasional spike
    if (Math.random() < spikeChance) {
      change *= spikeMultiplier * (Math.random() > 0.5 ? 1 : -1);
    }
    
    // Add slight trend bias occasionally
    if (Math.random() < 0.1) {
      change += (Math.random() - 0.5) * volatility * lastPrice * 2;
    }
    
    const newPrice = Math.max(lastPrice + change, lastPrice * 0.5); // Floor at 50% of price
    return parseFloat(newPrice.toFixed(2));
  }, [volatility, spikeChance, spikeMultiplier]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const newPrice = generateNextPrice();
      const now = Date.now();
      
      setCurrentPrice(newPrice);
      setPriceHistory(prev => {
        // Keep last 500 data points for chart
        const newHistory = [...prev, { t: now, price: newPrice }];
        if (newHistory.length > 500) {
          return newHistory.slice(-500);
        }
        return newHistory;
      });
    }, tickRate);

    return () => clearInterval(intervalId);
  }, [isRunning, tickRate, generateNextPrice]);

  const reset = useCallback((newInitialPrice = initialPrice) => {
    setCurrentPrice(newInitialPrice);
    setPriceHistory([{ t: Date.now(), price: newInitialPrice }]);
  }, [initialPrice]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const toggle = useCallback(() => setIsRunning(prev => !prev), []);

  return {
    currentPrice,
    priceHistory,
    isRunning,
    reset,
    pause,
    resume,
    toggle,
  };
}

export default useMarketSimulation;
