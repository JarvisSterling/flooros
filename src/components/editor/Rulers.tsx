'use client';
import React, { useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { pxPerMeter } from './GridLayer';

const RULER_SIZE = 24;

export default function Rulers() {
  const { zoom, panX, panY, stageWidth, stageHeight, unit } = useEditorStore();
  const convFactor = unit === 'ft' ? 3.28084 : 1;

  const hTicks = useMemo(() => {
    const ticks: { pos: number; label: string }[] = [];
    const startM = -panX / zoom / pxPerMeter;
    const endM = startM + stageWidth / zoom / pxPerMeter;
    const step = zoom > 0.5 ? 1 : zoom > 0.2 ? 5 : 10;
    const s = Math.floor(startM / step) * step;
    for (let m = s; m <= endM; m += step) {
      const px = m * pxPerMeter * zoom + panX;
      ticks.push({ pos: px, label: `${(m * convFactor).toFixed(m % 1 === 0 ? 0 : 1)}` });
    }
    return ticks;
  }, [zoom, panX, stageWidth, convFactor]);

  const vTicks = useMemo(() => {
    const ticks: { pos: number; label: string }[] = [];
    const startM = -panY / zoom / pxPerMeter;
    const endM = startM + stageHeight / zoom / pxPerMeter;
    const step = zoom > 0.5 ? 1 : zoom > 0.2 ? 5 : 10;
    const s = Math.floor(startM / step) * step;
    for (let m = s; m <= endM; m += step) {
      const px = m * pxPerMeter * zoom + panY;
      ticks.push({ pos: px, label: `${(m * convFactor).toFixed(m % 1 === 0 ? 0 : 1)}` });
    }
    return ticks;
  }, [zoom, panY, stageHeight, convFactor]);

  return (
    <>
      {/* Horizontal ruler */}
      <div className="absolute top-0 bg-[#0d1321]/80 backdrop-blur-sm border-b border-white/[0.06] overflow-hidden" style={{ left: RULER_SIZE, height: RULER_SIZE, width: stageWidth }}>
        <svg width={stageWidth} height={RULER_SIZE}>
          {hTicks.map((t, i) => (
            <g key={i}>
              <line x1={t.pos} y1={RULER_SIZE - 8} x2={t.pos} y2={RULER_SIZE} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
              <text x={t.pos + 2} y={RULER_SIZE - 10} fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="ui-monospace, monospace">{t.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {/* Vertical ruler */}
      <div className="absolute left-0 bg-[#0d1321]/80 backdrop-blur-sm border-r border-white/[0.06] overflow-hidden" style={{ top: RULER_SIZE, width: RULER_SIZE, height: stageHeight }}>
        <svg width={RULER_SIZE} height={stageHeight}>
          {vTicks.map((t, i) => (
            <g key={i}>
              <line x1={RULER_SIZE - 8} y1={t.pos} x2={RULER_SIZE} y2={t.pos} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
              <text x={2} y={t.pos - 2} fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="ui-monospace, monospace" transform={`rotate(-90, 2, ${t.pos - 2})`}>{t.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {/* Corner */}
      <div className="absolute top-0 left-0 bg-[#0a0f1a] border-b border-r border-white/[0.06] flex items-center justify-center text-[10px] text-white/20 font-mono" style={{ width: RULER_SIZE, height: RULER_SIZE }}>
        {unit}
      </div>
    </>
  );
}
