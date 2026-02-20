'use client';
import React, { useMemo } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { useEditorStore } from '@/store/editor-store';

import { PX_PER_METER } from '@/lib/constants';

const PIXELS_PER_METER = PX_PER_METER;

export const pxPerMeter = PIXELS_PER_METER;

export default function GridLayer() {
  const { zoom, panX, panY, gridSize, gridVisible, stageWidth, stageHeight } = useEditorStore();

  const elements = useMemo(() => {
    if (!gridVisible) return [];
    const result: React.ReactElement[] = [];
    const gridPx = gridSize * PIXELS_PER_METER;

    // Calculate visible area in world coordinates
    const left = -panX / zoom;
    const top = -panY / zoom;
    const right = left + stageWidth / zoom;
    const bottom = top + stageHeight / zoom;

    const startX = Math.floor(left / gridPx) * gridPx;
    const startY = Math.floor(top / gridPx) * gridPx;

    // At low zoom: dots. At high zoom: lines
    const useDots = zoom < 0.6;

    if (useDots) {
      // Dot grid — subtle, modern look
      const dotSpacing = gridPx;
      for (let x = startX; x <= right; x += dotSpacing) {
        for (let y = startY; y <= bottom; y += dotSpacing) {
          const isMajor = Math.abs(x % (gridPx * 5)) < 0.01 && Math.abs(y % (gridPx * 5)) < 0.01;
          result.push(
            <Circle
              key={`d${x},${y}`}
              x={x} y={y}
              radius={(isMajor ? 2 : 1) / zoom}
              fill={isMajor ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.12)'}
              listening={false}
            />
          );
        }
      }
    } else {
      // Line grid — for higher zoom
      for (let x = startX; x <= right; x += gridPx) {
        const isMajor = Math.abs(x % (gridPx * 5)) < 0.01;
        result.push(
          <Line
            key={`v${x}`}
            points={[x, top, x, bottom]}
            stroke={isMajor ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.06)'}
            strokeWidth={(isMajor ? 1 : 0.5) / zoom}
            listening={false}
          />
        );
      }
      for (let y = startY; y <= bottom; y += gridPx) {
        const isMajor = Math.abs(y % (gridPx * 5)) < 0.01;
        result.push(
          <Line
            key={`h${y}`}
            points={[left, y, right, y]}
            stroke={isMajor ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.06)'}
            strokeWidth={(isMajor ? 1 : 0.5) / zoom}
            listening={false}
          />
        );
      }
    }

    // Origin crosshair
    if (left <= 0 && right >= 0) {
      result.push(
        <Line key="origin-v" points={[0, top, 0, bottom]} stroke="rgba(59,130,246,0.2)" strokeWidth={1 / zoom} listening={false} />
      );
    }
    if (top <= 0 && bottom >= 0) {
      result.push(
        <Line key="origin-h" points={[left, 0, right, 0]} stroke="rgba(59,130,246,0.2)" strokeWidth={1 / zoom} listening={false} />
      );
    }

    return result;
  }, [zoom, panX, panY, gridSize, gridVisible, stageWidth, stageHeight]);

  return <Group listening={false}>{elements}</Group>;
}
