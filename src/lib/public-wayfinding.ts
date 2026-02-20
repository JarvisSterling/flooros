import type { FloorPlan, FloorPlanObject, NavNode, NavEdge } from '@/types/database';
import { generateNavGraph } from '@/lib/nav-graph-generator';
import { findPath, findNearestNode } from '@/lib/pathfinding';
import { findCrossFloorRoute } from '@/lib/cross-floor-routing';
import {
  generateDirections,
  totalDistance,
  estimateWalkingTime,
  formatWalkingTime,
  type DirectionStep,
} from '@/lib/directions';
import { PX_PER_METER } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WayfindingPoint {
  x: number;
  y: number;
  floorPlanId: string;
  label?: string;
}

export interface RouteSegment {
  floorPlanId: string;
  points: Array<{ x: number; y: number }>;
  directions: DirectionStep[];
  distanceM: number;
}

export interface WayfindingRoute {
  segments: RouteSegment[];
  totalDistanceM: number;
  estimatedTimeSeconds: number;
  formattedTime: string;
  directions: DirectionStep[];
  floorTransitions: Array<{
    fromFloorId: string;
    toFloorId: string;
    viaType: NavNode['type'];
  }>;
}

export interface BoothDestination {
  objectId: string;
  boothId?: string;
  label: string;
  x: number;
  y: number;
  floorPlanId: string;
}

export interface EntranceOption {
  nodeId?: string;
  objectId?: string;
  label: string;
  x: number;
  y: number;
  floorPlanId: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Detect entrance objects from floor plan objects */
export function detectEntrances(
  objects: FloorPlanObject[],
  nodes: NavNode[],
): EntranceOption[] {
  const entrances: EntranceOption[] = [];

  // From nav nodes
  for (const node of nodes) {
    if (node.type === 'entrance') {
      const meta = node.metadata as Record<string, unknown>;
      entrances.push({
        nodeId: node.id,
        label: (typeof meta?.['label'] === 'string' ? meta['label'] : null) ?? 'Entrance',
        x: node.x,
        y: node.y,
        floorPlanId: node.floor_plan_id,
      });
    }
  }

  // From objects tagged as entrance
  for (const obj of objects) {
    const label = (obj.label ?? '').toLowerCase();
    const tags = (obj.metadata?.['tags'] as string[] | undefined) ?? [];
    const isEntrance =
      label.includes('entrance') ||
      label.includes('entry') ||
      label.includes('gate') ||
      tags.some((t) => t.toLowerCase() === 'entrance');

    if (isEntrance) {
      // Avoid duplicates if we already have a nav node for this object
      const alreadyHave = entrances.some(
        (e) =>
          Math.abs(e.x - (obj.x + (obj.width ?? 0) / 2)) < 10 &&
          Math.abs(e.y - (obj.y + (obj.height ?? 0) / 2)) < 10,
      );
      if (!alreadyHave) {
        entrances.push({
          objectId: obj.id,
          label: obj.label ?? 'Entrance',
          x: obj.x + (obj.width ?? 0) / 2,
          y: obj.y + (obj.height ?? 0) / 2,
          floorPlanId: obj.floor_plan_id,
        });
      }
    }
  }

  return entrances;
}

/** Extract booth/exhibitor destinations from objects */
export function extractDestinations(
  objects: FloorPlanObject[],
): BoothDestination[] {
  return objects
    .filter((obj) => obj.type === 'booth' && obj.label)
    .map((obj) => ({
      objectId: obj.id,
      label: obj.label ?? 'Booth',
      x: obj.x + (obj.width ?? 0) / 2,
      y: obj.y + (obj.height ?? 0) / 2,
      floorPlanId: obj.floor_plan_id,
    }));
}

/* ------------------------------------------------------------------ */
/*  Graph building helpers                                             */
/* ------------------------------------------------------------------ */

interface BuiltGraph {
  nodes: NavNode[];
  edges: NavEdge[];
}

/**
 * Build / merge a nav graph.
 * If preloaded nodes+edges are available they are used directly;
 * otherwise we auto-generate from objects.
 */
export function buildGraph(
  objects: FloorPlanObject[],
  existingNodes: NavNode[],
  existingEdges: NavEdge[],
  floorPlanId: string,
  scalePxPerM: number = PX_PER_METER,
): BuiltGraph {
  if (existingNodes.length > 0 && existingEdges.length > 0) {
    return { nodes: existingNodes, edges: existingEdges };
  }

  // Auto-generate
  const result = generateNavGraph(objects, scalePxPerM);

  const nodes: NavNode[] = result.nodes.map((n, i) => ({
    id: `auto-${floorPlanId}-${i}`,
    floor_plan_id: floorPlanId,
    x: n.x,
    y: n.y,
    type: n.type,
    accessible: n.accessible,
    linked_floor_node_id: null,
    metadata: n.metadata,
  }));

  const edges: NavEdge[] = result.edges.map((e, i) => ({
    id: `auto-edge-${floorPlanId}-${i}`,
    from_node_id: nodes[e.fromIndex].id,
    to_node_id: nodes[e.toIndex].id,
    distance_m: e.distance_m,
    bidirectional: true,
    accessible: e.accessible,
    weight_modifier: 1,
  }));

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/*  Main API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Compute a wayfinding route from a point to a booth.
 *
 * @param floors       All floor plans for the event
 * @param objects      All floor plan objects across all floors
 * @param fromPoint    Starting position
 * @param toBoothId    Target object ID (booth)
 * @param navNodes     Pre-existing nav nodes (optional)
 * @param navEdges     Pre-existing nav edges (optional)
 */
export function computeRoute(
  floors: FloorPlan[],
  objects: FloorPlanObject[],
  fromPoint: WayfindingPoint,
  toBoothId: string,
  navNodes: NavNode[] = [],
  navEdges: NavEdge[] = [],
): WayfindingRoute | null {
  const targetObj = objects.find((o) => o.id === toBoothId);
  if (!targetObj) return null;

  const toX = targetObj.x + (targetObj.width ?? 0) / 2;
  const toY = targetObj.y + (targetObj.height ?? 0) / 2;
  const toFloorId = targetObj.floor_plan_id;

  // Build graphs per floor
  const allNodes: NavNode[] = [];
  const allEdges: NavEdge[] = [];

  for (const floor of floors) {
    const floorObjects = objects.filter((o) => o.floor_plan_id === floor.id);
    const floorNavNodes = navNodes.filter((n) => n.floor_plan_id === floor.id);
    const floorNavEdges = navEdges.filter((e) => {
      const nodeIds = new Set(floorNavNodes.map((n) => n.id));
      return nodeIds.has(e.from_node_id) && nodeIds.has(e.to_node_id);
    });

    const graph = buildGraph(
      floorObjects,
      floorNavNodes,
      floorNavEdges,
      floor.id,
      floor.scale_px_per_m || PX_PER_METER,
    );
    allNodes.push(...graph.nodes);
    allEdges.push(...graph.edges);
  }

  if (allNodes.length === 0) return null;

  // Find nearest nodes to start and end points
  const startFloorNodes = allNodes.filter((n) => n.floor_plan_id === fromPoint.floorPlanId);
  const endFloorNodes = allNodes.filter((n) => n.floor_plan_id === toFloorId);

  const startNode = findNearestNode(startFloorNodes, fromPoint.x, fromPoint.y);
  const endNode = findNearestNode(endFloorNodes, toX, toY);

  if (!startNode || !endNode) return null;

  const sameFloor = fromPoint.floorPlanId === toFloorId;
  const scalePxPerM =
    floors.find((f) => f.id === fromPoint.floorPlanId)?.scale_px_per_m ?? PX_PER_METER;

  if (sameFloor) {
    // Single-floor routing
    const result = findPath(startFloorNodes, allEdges, startNode.id, endNode.id);
    if (!result) return null;

    const dirs = generateDirections(result.nodes, scalePxPerM);
    const dist = totalDistance(dirs);
    const timeSec = estimateWalkingTime(dist);

    return {
      segments: [
        {
          floorPlanId: fromPoint.floorPlanId,
          points: result.nodes.map((n) => ({ x: n.x, y: n.y })),
          directions: dirs,
          distanceM: dist,
        },
      ],
      totalDistanceM: dist,
      estimatedTimeSeconds: timeSec,
      formattedTime: formatWalkingTime(timeSec),
      directions: dirs,
      floorTransitions: [],
    };
  }

  // Cross-floor routing
  const crossResult = findCrossFloorRoute(allNodes, allEdges, startNode.id, endNode.id, {
    scalePxPerM,
  });
  if (!crossResult) return null;

  const allDirections: DirectionStep[] = [];
  const segments: RouteSegment[] = crossResult.segments.map((seg) => {
    allDirections.push(...seg.directions);
    return {
      floorPlanId: seg.floor_plan_id,
      points: seg.nodes.map((n) => ({ x: n.x, y: n.y })),
      directions: seg.directions,
      distanceM: seg.distance_m,
    };
  });

  const timeSec = estimateWalkingTime(crossResult.total_distance_m);

  return {
    segments,
    totalDistanceM: crossResult.total_distance_m,
    estimatedTimeSeconds: timeSec,
    formattedTime: formatWalkingTime(timeSec),
    directions: allDirections,
    floorTransitions: crossResult.floor_transitions.map((t) => ({
      fromFloorId: t.from_floor_id,
      toFloorId: t.to_floor_id,
      viaType: t.via_node_type,
    })),
  };
}
