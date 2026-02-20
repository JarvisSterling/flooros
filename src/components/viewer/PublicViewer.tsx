'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Group } from 'react-konva';
import type Konva from 'konva';
import { PX_PER_METER } from '@/lib/constants';
import type { PublicObject, PublicBooth } from '@/lib/api/public';

const PPM = PX_PER_METER;

const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  reserved: '#eab308',
  sold: '#3b82f6',
  blocked: '#ef4444',
};

interface Props {
  objects: PublicObject[];
  booths: PublicBooth[];
  planWidth: number;
  planHeight: number;
  brandColor: string;
  highlightedObjectIds: Set<string>;
  onBoothClick: (booth: PublicBooth, screenX: number, screenY: number) => void;
}

export default function PublicViewer({
  objects, booths, planWidth, planHeight, brandColor,
  highlightedObjectIds, onBoothClick,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const boothMap = React.useMemo(() => {
    const m = new Map<string, PublicBooth>();
    booths.forEach(b => { if (b.object_id) m.set(b.object_id, b); });
    return m;
  }, [booths]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.max(400, Math.min(w * 0.65, window.innerHeight - 200));
      setSize({ width: w, height: h });
      const scaleX = w / planWidth;
      const scaleY = h / planHeight;
      const s = Math.min(scaleX, scaleY, 2) * 0.9;
      setZoom(s);
      setPan({ x: (w - planWidth * s) / 2, y: (h - planHeight * s) / 2 });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [planWidth, planHeight]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const factor = 1.08;
    const oldZoom = zoom;
    const newZoom = Math.min(5, Math.max(0.2, direction > 0 ? oldZoom * factor : oldZoom / factor));
    const mousePointTo = { x: (pointer.x - pan.x) / oldZoom, y: (pointer.y - pan.y) / oldZoom };
    setPan({ x: pointer.x - mousePointTo.x * newZoom, y: pointer.y - mousePointTo.y * newZoom });
    setZoom(newZoom);
  }, [zoom, pan]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const isStage = e.target === e.target.getStage();
    if (e.evt.button === 1 || (e.evt.button === 0 && isStage)) {
      isPanning.current = true;
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning.current) return;
    const dx = e.evt.clientX - lastPointer.current.x;
    const dy = e.evt.clientY - lastPointer.current.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const lastDist = useRef(0);

  const handleTouchStart = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 1) {
      isPanning.current = true;
      lastPointer.current = { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY };
    }
    if (e.evt.touches.length === 2) {
      isPanning.current = false;
      lastDist.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      e.evt.preventDefault();
      const dist = Math.sqrt((touches[1].clientX - touches[0].clientX) ** 2 + (touches[1].clientY - touches[0].clientY) ** 2);
      const center = { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 };
      if (lastDist.current > 0) {
        const scale = dist / lastDist.current;
        const newZoom = Math.min(5, Math.max(0.2, zoom * scale));
        setZoom(newZoom);
        setPan(p => ({ x: center.x - (center.x - p.x) * scale, y: center.y - (center.y - p.y) * scale }));
      }
      lastDist.current = dist;
    } else if (touches.length === 1 && isPanning.current) {
      const dx = touches[0].clientX - lastPointer.current.x;
      const dy = touches[0].clientY - lastPointer.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPointer.current = { x: touches[0].clientX, y: touches[0].clientY };
    }
  }, [zoom]);

  const handleTouchEnd = useCallback(() => { isPanning.current = false; lastDist.current = 0; }, []);

  const renderObject = (obj: PublicObject) => {
    const booth = boothMap.get(obj.id);
    const props = (obj.properties ?? {});
    const style = (props.style ?? props);
    const isBooth = obj.type === 'booth' || !!booth;
    const isHighlighted = highlightedObjectIds.size > 0 && highlightedObjectIds.has(obj.id);
    const isDimmed = highlightedObjectIds.size > 0 && !highlightedObjectIds.has(obj.id) && isBooth;

    let fill = style.fill || '#4A90D9';
    let stroke = style.stroke || '#333';
    const strokeWidth = style.strokeWidth ?? 1;
    const opacity = isDimmed ? 0.3 : 1;

    if (isBooth && booth) {
      fill = STATUS_COLORS[booth.status] || fill;
      stroke = isHighlighted ? '#ffffff' : 'rgba(255,255,255,0.3)';
    }

    const boothNumber = booth?.number || props.booth_number || '';
    const exhibitorName = booth?.exhibitor?.company_name || '';

    const handleClick = () => {
      if (!booth) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const container = stage.container().getBoundingClientRect();
      onBoothClick(booth, container.left + pointer.x, container.top + pointer.y);
    };

    const x = obj.x * PPM;
    const y = obj.y * PPM;
    const w = (obj.width ?? 100) * PPM;
    const h = (obj.height ?? 100) * PPM;
    const rawPoints = props.points;

    if (obj.type === 'wall' || style.shape === 'line') {
      const pts = rawPoints ? rawPoints.flatMap(p => [p.x * PPM, p.y * PPM]) : [0, 0, w, 0];
      return <Line key={obj.id} x={x} y={y} points={pts} stroke={stroke} strokeWidth={strokeWidth || 2} opacity={opacity} listening={false} />;
    }

    if (rawPoints && rawPoints.length >= 3) {
      const polyPts = rawPoints.flatMap(p => [p.x * PPM, p.y * PPM]);
      return (
        <Group key={obj.id} x={x} y={y} rotation={obj.rotation} opacity={opacity} onClick={isBooth ? handleClick : undefined} onTap={isBooth ? handleClick : undefined}>
          <Line points={polyPts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} closed />
          {isBooth && boothNumber && (
            <Text text={String(boothNumber)} x={rawPoints.reduce((s, p) => s + p.x, 0) / rawPoints.length * PPM - 30} y={rawPoints.reduce((s, p) => s + p.y, 0) / rawPoints.length * PPM - 8} width={60} align="center" fontSize={11} fontStyle="bold" fill="#fff" shadowColor="#000" shadowBlur={2} listening={false} />
          )}
        </Group>
      );
    }

    if (style.shape === 'circle' || props.shape === 'circle') {
      return (
        <Group key={obj.id} x={x} y={y} rotation={obj.rotation} opacity={opacity} onClick={isBooth ? handleClick : undefined} onTap={isBooth ? handleClick : undefined}>
          <Ellipse radiusX={w / 2} radiusY={h / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          {isBooth && boothNumber && (
            <Text text={String(boothNumber)} x={-w / 2} y={-7} width={w} align="center" fontSize={11} fontStyle="bold" fill="#fff" shadowColor="#000" shadowBlur={2} listening={false} />
          )}
        </Group>
      );
    }

    const fontSize = Math.min(w, h) * 0.2;
    return (
      <Group key={obj.id} x={x} y={y} rotation={obj.rotation} opacity={opacity} onClick={isBooth ? handleClick : undefined} onTap={isBooth ? handleClick : undefined}>
        <Rect width={w} height={h} fill={fill} stroke={isHighlighted ? '#fff' : stroke} strokeWidth={isHighlighted ? 2 : strokeWidth} cornerRadius={2} />
        {isBooth && boothNumber && (
          <Text text={String(boothNumber)} x={0} y={h * 0.25} width={w} align="center" fontSize={Math.max(9, fontSize)} fontStyle="bold" fill="#fff" shadowColor="#000" shadowBlur={2} listening={false} />
        )}
        {isBooth && exhibitorName && (
          <Text text={exhibitorName} x={2} y={h * 0.55} width={w - 4} align="center" fontSize={Math.max(7, fontSize * 0.6)} fill="#fff" shadowColor="#000" shadowBlur={1} listening={false} ellipsis={true} wrap="none" />
        )}
      </Group>
    );
  };

  const sorted = [...objects].sort((a, b) => a.z_index - b.z_index);

  return (
    <div ref={containerRef} className="w-full touch-none" style={{ minHeight: 400 }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ background: '#111827', cursor: 'grab' }}
      >
        <Layer>
          <Rect x={0} y={0} width={planWidth} height={planHeight} fill="#1a1a2e" stroke="rgba(255,255,255,0.05)" strokeWidth={1} listening={false} />
          {sorted.map(renderObject)}
        </Layer>
      </Stage>
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-900/80 border-t border-white/5 text-xs text-white/50">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
