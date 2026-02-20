'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Group, Line, Circle, Text, Label, Tag } from 'react-konva';
import type { WayfindingRoute } from '@/lib/public-wayfinding';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ViewerRouteOverlayProps {
  route: WayfindingRoute | null;
  currentFloorId: string;
  /** Animation enabled (default true) */
  animated?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROUTE_COLOR = '#3b82f6';
const ROUTE_GLOW_COLOR = '#60a5fa';
const ROUTE_WIDTH = 4;
const ROUTE_DASH = [12, 8];
const START_COLOR = '#22c55e';
const END_COLOR = '#ef4444';
const MARKER_RADIUS = 10;
const TRANSITION_COLOR = '#f59e0b';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ViewerRouteOverlay({
  route,
  currentFloorId,
  animated = true,
}: ViewerRouteOverlayProps) {
  const lineRef = useRef<InstanceType<typeof Line> | null>(null);
  const animFrameRef = useRef<number>(0);
  const dashOffsetRef = useRef(0);

  /* Animate dashes */
  const animate = useCallback(() => {
    if (!lineRef.current || !animated) return;
    dashOffsetRef.current -= 0.8;
    if (dashOffsetRef.current < -200) dashOffsetRef.current = 0;
    lineRef.current.dashOffset(dashOffsetRef.current);
    lineRef.current.getLayer()?.batchDraw();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [animated]);

  useEffect(() => {
    if (animated && route) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animated, route, animate]);

  if (!route) return null;

  // Get segments for the current floor
  const floorSegments = route.segments.filter((s) => s.floorPlanId === currentFloorId);
  if (floorSegments.length === 0) return null;

  // Flatten all points on this floor
  const allPoints = floorSegments.flatMap((seg) => seg.points);
  if (allPoints.length < 2) return null;

  const flatPoints = allPoints.flatMap((p) => [p.x, p.y]);

  const startPoint = allPoints[0];
  const endPoint = allPoints[allPoints.length - 1];

  // Check for floor transitions from/to this floor
  const transitionsFromHere = route.floorTransitions.filter(
    (t) => t.fromFloorId === currentFloorId,
  );

  return (
    <Group listening={false}>
      {/* Glow line (wider, semi-transparent) */}
      <Line
        points={flatPoints}
        stroke={ROUTE_GLOW_COLOR}
        strokeWidth={ROUTE_WIDTH * 3}
        opacity={0.15}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />

      {/* Main route line */}
      <Line
        ref={(node) => {
          lineRef.current = node;
        }}
        points={flatPoints}
        stroke={ROUTE_COLOR}
        strokeWidth={ROUTE_WIDTH}
        dash={ROUTE_DASH}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />

      {/* Start marker (green circle) */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={MARKER_RADIUS}
        fill={START_COLOR}
        stroke="#fff"
        strokeWidth={2}
        listening={false}
      />
      <Text
        x={startPoint.x - 4}
        y={startPoint.y - 5}
        text="S"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
        listening={false}
      />

      {/* End marker (red pin) */}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={MARKER_RADIUS}
        fill={END_COLOR}
        stroke="#fff"
        strokeWidth={2}
        listening={false}
      />
      <Text
        x={endPoint.x - 4}
        y={endPoint.y - 5}
        text="E"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
        listening={false}
      />

      {/* Floor transition indicators */}
      {transitionsFromHere.map((t, i) => {
        // The transition point is the last point of the segment on this floor
        const seg = floorSegments[floorSegments.length - 1];
        const lastPt = seg.points[seg.points.length - 1];
        return (
          <Group key={`transition-${i}`}>
            <Label x={lastPt.x + 14} y={lastPt.y - 14} listening={false}>
              <Tag
                fill={TRANSITION_COLOR}
                cornerRadius={4}
                pointerDirection="left"
                pointerWidth={8}
                pointerHeight={8}
                stroke="#fff"
                strokeWidth={1}
              />
              <Text
                text={`Go to ${t.viaType === 'elevator' ? '🛗' : '🪜'} →`}
                fontSize={11}
                fontStyle="bold"
                fill="#fff"
                padding={6}
                listening={false}
              />
            </Label>
            {/* Pulsing circle at transition point */}
            <Circle
              x={lastPt.x}
              y={lastPt.y}
              radius={MARKER_RADIUS + 2}
              fill={TRANSITION_COLOR}
              opacity={0.6}
              stroke="#fff"
              strokeWidth={2}
              listening={false}
            />
          </Group>
        );
      })}
    </Group>
  );
}
