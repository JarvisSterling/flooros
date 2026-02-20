'use client';
import React, { useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { pxPerMeter } from './GridLayer';

const MM_W = 200;
const MM_H = 150;

export default function Minimap() {
  const { objects, zoom, panX, panY, stageWidth, stageHeight } = useEditorStore();

  const { bounds, scale } = useMemo(() => {
    let minX = 0, minY = 0, maxX = 20, maxY = 15;
    objects.forEach((o) => {
      minX = Math.min(minX, o.x);
      minY = Math.min(minY, o.y);
      maxX = Math.max(maxX, o.x + (o.width ?? 1));
      maxY = Math.max(maxY, o.y + (o.height ?? 1));
    });
    const pad = 2;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const scale = Math.min(MM_W / rangeX, MM_H / rangeY);
    return { bounds: { minX, minY, maxX, maxY, rangeX, rangeY }, scale };
  }, [objects]);

  const vpX = (-panX / zoom) / pxPerMeter;
  const vpY = (-panY / zoom) / pxPerMeter;
  const vpW = stageWidth / zoom / pxPerMeter;
  const vpH = stageHeight / zoom / pxPerMeter;

  return (
    <div
      className="absolute bottom-3 right-3 bg-[#0d1321]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
      style={{ width: MM_W, height: MM_H }}
    >
      <svg width={MM_W} height={MM_H} viewBox={`0 0 ${MM_W} ${MM_H}`}>
        {Array.from(objects.values()).map((o) => (
          <rect
            key={o.id}
            x={(o.x - bounds.minX) * scale}
            y={(o.y - bounds.minY) * scale}
            width={Math.max((o.width ?? 0.5) * scale, 2)}
            height={Math.max((o.height ?? 0.5) * scale, 2)}
            fill="#3b82f6"
            opacity={0.5}
            rx={1}
          />
        ))}
        <rect
          x={(vpX - bounds.minX) * scale}
          y={(vpY - bounds.minY) * scale}
          width={vpW * scale}
          height={vpH * scale}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="3 2"
          opacity={0.8}
          rx={2}
        />
      </svg>
      <div className="absolute bottom-1 right-2 text-[9px] text-white/20 font-mono">{Math.round(zoom * 100)}%</div>
    </div>
  );
}
