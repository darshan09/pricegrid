import React, { useRef, useEffect, useCallback } from 'react';
import { useTradingStore, BlockState } from '../store/tradingStore';

const LiveChart = ({ priceHistory, currentPrice, width = 800, height = 200 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const blocks = useTradingStore(state => state.blocks);
  
  // Get armed block prices for markers
  const armedPrices = blocks
    .filter(b => b.state === BlockState.ARMED)
    .map(b => b.targetPrice);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Scale for retina displays
    ctx.save();
    ctx.scale(dpr, dpr);
    
    const w = width;
    const h = height;
    const padding = { top: 20, right: 60, bottom: 30, left: 20 };
    const chartWidth = w - padding.left - padding.right;
    const chartHeight = h - padding.top - padding.bottom;
    
    // Calculate price range
    const prices = priceHistory.map(p => p.price);
    const allPrices = [...prices, ...armedPrices, currentPrice];
    const minPrice = Math.min(...allPrices) - 5;
    const maxPrice = Math.max(...allPrices) + 5;
    const priceRange = maxPrice - minPrice || 1;
    
    // Draw grid
    ctx.strokeStyle = '#2A1C2B';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (price levels)
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange * i) / gridLines;
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`₹${price.toFixed(0)}`, w - padding.right + 5, y + 4);
    }
    
    // Vertical grid lines (time)
    const vLines = 8;
    for (let i = 0; i <= vLines; i++) {
      const x = padding.left + (chartWidth * i) / vLines;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();
    }
    
    // Draw armed price markers (horizontal dashed lines)
    armedPrices.forEach(targetPrice => {
      const y = padding.top + chartHeight * (1 - (targetPrice - minPrice) / priceRange);
      
      ctx.strokeStyle = '#E0FF66';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label
      ctx.fillStyle = '#E0FF66';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${targetPrice}`, w - padding.right - 5, y - 5);
    });
    
    // Draw price line
    if (priceHistory.length > 1) {
      const points = priceHistory.map((point, i) => ({
        x: padding.left + (chartWidth * i) / (priceHistory.length - 1),
        y: padding.top + chartHeight * (1 - (point.price - minPrice) / priceRange),
      }));
      
      // Glow effect (multiple strokes)
      const glowColors = [
        'rgba(245, 85, 162, 0.1)',
        'rgba(245, 85, 162, 0.2)',
        'rgba(245, 85, 162, 0.4)',
      ];
      const glowWidths = [8, 5, 3];
      
      glowColors.forEach((color, i) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = glowWidths[i];
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
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 85, 162, 0.3)';
      ctx.fill();
      
      // Inner dot
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#F555A2';
      ctx.fill();
      
      // Current price label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${currentPrice.toFixed(2)}`, lastPoint.x - 10, lastPoint.y - 10);
    }
    
    ctx.restore();
  }, [priceHistory, currentPrice, armedPrices, width, height]);

  // Set up canvas and animation loop
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
        style={{ background: '#050505' }}
        data-testid="live-chart-canvas"
      />
    </div>
  );
};

export default LiveChart;
