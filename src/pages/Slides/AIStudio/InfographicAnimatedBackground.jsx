import React, { useEffect, useRef, useState } from 'react';

const getPalette = (theme, mode) => {
  const isDark = mode === 'dark';
  const palettes = {
    blue: { h: 221, s: 83, l: isDark ? 65 : 53 },
    purple: { h: 270, s: 60, l: isDark ? 68 : 55 },
    green: { h: 142, s: 71, l: isDark ? 55 : 45 },
    orange: { h: 25, s: 95, l: isDark ? 65 : 50 }
  };
  
  const base = palettes[theme] || palettes.blue;
  
  return {
    dotColor: `hsla(${base.h}, ${base.s}%, ${base.l}%, ${isDark ? 0.8 : 0.5})`,
    lineColor: `hsla(${base.h}, ${base.s}%, ${base.l}%, ${isDark ? 0.35 : 0.2})`,
    shapeFill: `hsla(${base.h}, ${base.s}%, ${base.l}%, ${isDark ? 0.08 : 0.05})`
  };
};

export default function InfographicAnimatedBackground({ theme = 'blue', mode = 'dark' }) {
  const canvasRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d'); 
    let animationFrameId;
    let startTime = performance.now();
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const rootStyle = getComputedStyle(document.documentElement);
    let primaryRgb = rootStyle.getPropertyValue('--primary-rgb').trim();
    if (!primaryRgb) primaryRgb = '37, 99, 235'; // fallback to a default blue if not set

    const numNodes = 45; // Reduced so they don't cluster as much
    
    // Bottom boundary: keep dots away from the wave and composer
    const bottomBound = 0.7;

    const nodes = Array.from({ length: numNodes }, () => {
      let x = Math.random();
      let y = Math.random() * bottomBound; // only spawn in top 70%
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.0008, // extremely slow drift
        vy: (Math.random() - 0.5) * 0.0008,
        radius: Math.random() * 2 + 1.5,
      };
    });

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Make baseAlpha lower so the whole effect is lighter
      const baseAlpha = mode === 'dark' ? 0.25 : 0.3;
      
      // Update positions
      nodes.forEach(n => {
        if (!reducedMotion) {
           n.x += n.vx;
           n.y += n.vy;
           
           // Bounce off outer walls (and bottom bound)
           if (n.x < 0) { n.x = 0; n.vx *= -1; }
           if (n.x > 1) { n.x = 1; n.vx *= -1; }
           if (n.y < 0) { n.y = 0; n.vy *= -1; }
           if (n.y > bottomBound) { n.y = bottomBound; n.vy *= -1; }
        }
      });

      const connectDist = Math.max(canvas.width, canvas.height) * 0.12; 
      
      // Draw network
      for (let i = 0; i < nodes.length; i++) {
        const p1 = nodes[i];
        const px1 = p1.x * canvas.width;
        const py1 = p1.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(px1, py1, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgb}, ${baseAlpha + 0.15})`; // Slightly lighter dots
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
           const p2 = nodes[j];
           const px2 = p2.x * canvas.width;
           const py2 = p2.y * canvas.height;
           const dist12 = Math.hypot(px2 - px1, py2 - py1);

           if (dist12 < connectDist) {
              // Draw connecting line
              const lineAlpha = (1 - (dist12 / connectDist)) * baseAlpha * 0.3; // Much lighter lines
              ctx.beginPath();
              ctx.moveTo(px1, py1);
              ctx.lineTo(px2, py2);
              ctx.strokeStyle = `rgba(${primaryRgb}, ${lineAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();

              // Draw geometric shapes (triangles) if a 3rd point is also close
              for (let k = j + 1; k < nodes.length; k++) {
                 const p3 = nodes[k];
                 const px3 = p3.x * canvas.width;
                 const py3 = p3.y * canvas.height;
                 const dist13 = Math.hypot(px3 - px1, py3 - py1);
                 
                 // Optimization: only check 2nd distance if 1st is close
                 if (dist13 < connectDist) {
                   const dist23 = Math.hypot(px3 - px2, py3 - py2);
                   if (dist23 < connectDist) {
                      const polyAlpha = Math.min(
                         1 - (dist12 / connectDist),
                         1 - (dist13 / connectDist),
                         1 - (dist23 / connectDist)
                      ) * baseAlpha * 0.04; // Extremely light, barely visible shadows
                      
                      ctx.beginPath();
                      ctx.moveTo(px1, py1);
                      ctx.lineTo(px2, py2);
                      ctx.lineTo(px3, py3);
                      ctx.closePath();
                      ctx.fillStyle = `rgba(${primaryRgb}, ${polyAlpha})`;
                      ctx.fill();
                   }
                 }
              }
           }
        }
      }

      if (reducedMotion && time > 100) return;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, mode, reducedMotion]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
