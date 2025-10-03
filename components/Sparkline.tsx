"use client";
import React, { useState, useRef } from 'react';

interface SparklineProps {
  points: Array<{ t:number; p:number }> | undefined;
  width?: number;
  height?: number;
  stroke?: string;
  positive?: boolean;
  tooltipFormat?: (pt:{t:number;p:number}) => string;
}

export default function Sparkline({ points, width=60, height=20, stroke, positive, tooltipFormat }: SparklineProps) {
  if (!points || points.length === 0) {
    return <div className="w-[60px] h-[20px] bg-black/30 rounded" />;
  }
  const containerRef = useRef<HTMLDivElement|null>(null);
  const [hover, setHover] = useState<{ x:number; y:number; pt:{t:number;p:number} }|null>(null);
  const xs = points.map(p=>p.t);
  const ys = points.map(p=>p.p);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanY = maxY - minY || 1;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const spanX = maxX - minX || 1;
  const d = points.map((pt,i) => {
    const x = ((pt.t - minX) / spanX) * (width-2) + 1;
    const y = height - (((pt.p - minY)/spanY) * (height-2) + 1);
    return `${i===0?'M':'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const col = stroke || (positive ? '#22c55e' : '#ef4444');
  const handleMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, relX / rect.width));
    const targetT = minX + ratio * spanX;
    // find nearest point
    let nearest = points[0];
    let best = Math.abs(points[0].t - targetT);
    for (let i=1;i<points.length;i++) {
      const diff = Math.abs(points[i].t - targetT);
      if (diff < best) { best = diff; nearest = points[i]; }
    }
    const x = ((nearest.t - minX) / spanX) * (width-2) + 1;
    const y = height - (((nearest.p - minY)/spanY) * (height-2) + 1);
    setHover({ x, y, pt: nearest });
  };
  return (
    <div ref={containerRef} className="relative group" onMouseMove={handleMove} onMouseLeave={()=>setHover(null)} style={{width, height}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible pointer-events-none">
        <path d={d} fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {hover && (
          <g>
            <circle cx={hover.x} cy={hover.y} r={2.8} fill={col} stroke="#000" strokeWidth={1} />
          </g>
        )}
      </svg>
      {hover && (
        <div className="absolute z-10 px-2 py-1 rounded bg-black/80 text-[10px] text-white/80 pointer-events-none" style={{ left: Math.min(Math.max(hover.x-20,0), width-50), top: hover.y < 12 ? hover.y+6 : hover.y-24 }}>
          {tooltipFormat ? tooltipFormat(hover.pt) : `${new Date(hover.pt.t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${hover.pt.p.toFixed(4)}`}
        </div>
      )}
    </div>
  );
}
