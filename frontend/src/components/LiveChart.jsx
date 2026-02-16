import React, { useRef, useEffect, useCallback } from 'react';
import { useTradingStore } from '../store/tradingStore';

const LiveChart = ({ priceHistory, currentPrice, width = 800, height = 200 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const armedOrders = useTradingStore(state => state.armedOrders);
  const marketSnapshot = useTradingStore(state => state.marketSnapshot);
  
  // Get armed prices from Map
  const armedPrices = Array.from(armedOrders.keys());

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    
    const w = width;
    const h = height;
    const padding = { top: 15, right: 55, bottom: 25, left: 15 };
    const chartWidth = w - padding.left - padding.right;
    const chartHeight = h - padding.top - padding.bottom;
    
    const prices = priceHistory.map(p => p.price);
    const { bestBid, bestAsk } = marketSnapshot;
    const allPrices = [...prices, ...armedPrices, currentPrice];
    if (bestBid) allPrices.push(bestBid);
    if (bestAsk) allPrices.push(bestAsk);
    
    const minPrice = Math.min(...allPrices) - 3;
    const maxPrice = Math.max(...allPrices) + 3;
    const priceRange = maxPrice - minPrice || 1;
    
    // Grid
    ctx.strokeStyle = '#2A1C2B';
    ctx.lineWidth = 1;
    
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      
      const price = maxPrice - (priceRange * i) / gridLines;
      ctx.fillStyle = '#F555A2';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`₹${price.toFixed(0)}`, w - padding.right + 5, y + 3);
    }
    
    const vLines = 6;
    for (let i = 0; i <= vLines; i++) {
      const x = padding.left + (chartWidth * i) / vLines;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();
    }
    
    // Bid line
    if (bestBid) {
      const y = padding.top + chartHeight * (1 - (bestBid - minPrice) / priceRange);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`BID`, w - padding.right - 5, y - 3);
    }
    
    // Ask line
    if (bestAsk) {
      const y = padding.top + chartHeight * (1 - (bestAsk - minPrice) / priceRange);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`ASK`, w - padding.right - 5, y - 3);
    }
    
    // Armed price markers
    armedPrices.forEach(targetPrice => {
      const y = padding.top + chartHeight * (1 - (targetPrice - minPrice) / priceRange);
      
      ctx.strokeStyle = '#E0FF66';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#E0FF66';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`TARGET ₹${targetPrice.toFixed(2)}`, padding.left + 5, y - 4);
    });
    
    // Price line
    if (priceHistory.length > 1) {
      const points = priceHistory.map((point, i) => ({
        x: padding.left + (chartWidth * i) / (priceHistory.length - 1),
        y: padding.top + chartHeight * (1 - (point.price - minPrice) / priceRange),
      }));
      
      // Glow
      const glowLayers = [
        { color: 'rgba(245, 85, 162, 0.05)', width: 12 },
        { color: 'rgba(245, 85, 162, 0.1)', width: 8 },
        { color: 'rgba(245, 85, 162, 0.2)', width: 5 },
        { color: 'rgba(245, 85, 162, 0.4)', width: 3 },
      ];
      
      glowLayers.forEach(({ color, width: lineWidth }) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();
      });
      
      // Main line
      ctx.strokeStyle = '#F555A2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let j = 1; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }
      ctx.stroke();
      
      // Current price dot
      const lastPoint = points[points.length - 1];
      
      [12, 8, 5].forEach((radius, i) => {
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 85, 162, ${0.1 + i * 0.1})`;
        ctx.fill();
      });
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F555A2';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
    
    ctx.restore();
  }, [priceHistory, currentPrice, armedPrices, marketSnapshot, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, width, height]);

  return (
    <div className="relative" data-testid="live-chart-container">
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{ background: '#0A0510' }}
        data-testid="live-chart-canvas"
      />
    </div>
  );
};

export default LiveChart;
