'use client';
import React, { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { FloorPlanObject, LayerType, ObjectType, BoothStatus, BoothSizeCategory } from '@/types/database';
import { BOOTH_STATUS_BORDER, BOOTH_STATUS_LABELS, SIZE_CATEGORY_LABELS } from '@/lib/booth-helpers';
import CrossFloorLinkPanel from './CrossFloorLinkPanel';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronDown, ChevronRight, Lock, Unlock, X, Plus,
  Move, Palette, Store, FileText, Layers, Hash,
  MousePointer2,
} from 'lucide-react';

const CATEGORIES: ObjectType[] = ['booth', 'wall', 'zone', 'furniture', 'infrastructure', 'annotation'];
const LAYER_OPTIONS: LayerType[] = ['background', 'structure', 'booths', 'zones', 'furniture', 'annotations', 'default'];
const BOOTH_STATUSES: BoothStatus[] = ['available', 'reserved', 'sold', 'blocked', 'premium'];
const SIZE_CATEGORIES: BoothSizeCategory[] = ['small', 'medium', 'large', 'xl'];

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors duration-150"
      >
        {icon && <span className="text-white/30">{icon}</span>}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{children}</label>;
}

function FieldInput({ type = 'text', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      {...props}
      className={`w-full h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-150 ${props.className || ''}`}
    />
  );
}

export default function PropertiesPanel() {
  const {
    selectedObjectIds, objects, updateObject,
    booths, boothProfiles,
    convertToBooth, updateBoothStatus, updateBoothNumber, updateBoothExhibitor,
    updateBoothProfile, removeBooth, updateBoothField,
  } = useEditorStore();
  const [lockAspect, setLockAspect] = useState(false);

  if (selectedObjectIds.size === 0) {
    return (
      <div className="w-64 bg-[#0a0f1a] border-l border-white/10 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <MousePointer2 size={20} className="text-white/20" />
        </div>
        <p className="text-xs text-white/40 text-center">Select an object to edit its properties</p>
      </div>
    );
  }

  if (selectedObjectIds.size > 1) {
    return (
      <div className="w-64 bg-[#0a0f1a] border-l border-white/10 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
          <Layers size={20} className="text-blue-400" />
        </div>
        <p className="text-sm font-medium text-white/70">{selectedObjectIds.size} objects</p>
        <p className="text-xs text-white/40">Multi-selection</p>
      </div>
    );
  }

  const id = Array.from(selectedObjectIds)[0];
  const obj = objects.get(id);
  if (!obj) return null;

  const style = (obj.style || {}) as Record<string, unknown>;
  const metadata = (obj.metadata || {}) as Record<string, unknown>;
  const booth = booths.get(id);
  const boothProfile = booth ? boothProfiles.get(booth.id) : undefined;
  const isBooth = obj.type === 'booth' || !!booth;

  const update = (updates: Partial<FloorPlanObject>) => updateObject(id, updates);
  const updateStyle = (key: string, value: unknown) => update({ style: { ...style, [key]: value } });

  const setWidth = (w: number) => {
    if (lockAspect && obj.width && obj.height) {
      const ratio = obj.height / obj.width;
      update({ width: w, height: w * ratio });
    } else {
      update({ width: w });
    }
  };

  const setHeight = (h: number) => {
    if (lockAspect && obj.width && obj.height) {
      const ratio = obj.width / obj.height;
      update({ height: h, width: h * ratio });
    } else {
      update({ height: h });
    }
  };

  return (
    <div className="w-64 bg-[#0a0f1a] border-l border-white/10 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/70">Properties</h3>
        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{obj.shape || obj.type}</span>
      </div>

      {/* Booth convert/remove */}
      {!isBooth && (
        <div className="px-3 py-2 border-b border-white/5">
          <button
            className="w-full h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all duration-150 flex items-center justify-center gap-1.5"
            onClick={() => convertToBooth(id)}
          >
            <Store size={14} /> Convert to Booth
          </button>
        </div>
      )}
      {isBooth && booth && (
        <div className="px-3 py-2 border-b border-white/5">
          <button
            className="w-full h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all duration-150 flex items-center justify-center gap-1.5"
            onClick={() => removeBooth(id)}
          >
            <X size={14} /> Remove Booth
          </button>
        </div>
      )}

      {/* Label */}
      <div className="px-3 py-2 border-b border-white/5">
        <FieldLabel>Label</FieldLabel>
        <FieldInput value={obj.label || ''} onChange={(e) => update({ label: (e.target as HTMLInputElement).value || null })} placeholder="Object label..." />
      </div>

      {/* Transform */}
      <Section title="Transform" icon={<Move size={12} />}>
        <div className="space-y-2">
          <div>
            <FieldLabel>Position</FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">X</span>
                <FieldInput type="number" step="0.1" value={obj.x} onChange={(e) => update({ x: Number((e.target as HTMLInputElement).value) })} className="pl-6" />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">Y</span>
                <FieldInput type="number" step="0.1" value={obj.y} onChange={(e) => update({ y: Number((e.target as HTMLInputElement).value) })} className="pl-6" />
              </div>
            </div>
          </div>

          {obj.width != null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel>Size</FieldLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setLockAspect(!lockAspect)}
                      className={`p-0.5 rounded transition-colors ${lockAspect ? 'text-blue-400' : 'text-white/30 hover:text-white/50'}`}
                    >
                      {lockAspect ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{lockAspect ? 'Unlock' : 'Lock'} Aspect Ratio</TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">W</span>
                  <FieldInput type="number" step="0.1" value={obj.width ?? 0} onChange={(e) => setWidth(Number((e.target as HTMLInputElement).value))} className="pl-7" />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">H</span>
                  <FieldInput type="number" step="0.1" value={obj.height ?? 0} onChange={(e) => setHeight(Number((e.target as HTMLInputElement).value))} className="pl-7" />
                </div>
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Rotation</FieldLabel>
            <div className="relative">
              <FieldInput type="number" min="0" max="360" value={obj.rotation} onChange={(e) => update({ rotation: Number((e.target as HTMLInputElement).value) })} className="pr-6" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30">°</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Appearance (non-booth only) */}
      {!isBooth && (
        <Section title="Appearance" icon={<Palette size={12} />}>
          <div className="space-y-2">
            <div>
              <FieldLabel>Fill</FieldLabel>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input type="color" value={String(style.fill || '#4A90D9')} onChange={(e) => updateStyle('fill', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5" />
                </div>
                <div className="flex-1">
                  <Slider value={[Number(style.opacity ?? 1)]} onValueChange={([v]) => updateStyle('opacity', v)} min={0} max={1} step={0.05} />
                </div>
                <span className="text-[10px] text-white/30 w-8 text-right tabular-nums">{Math.round(Number(style.opacity ?? 1) * 100)}%</span>
              </div>
            </div>
            <div>
              <FieldLabel>Border</FieldLabel>
              <div className="flex items-center gap-2 mb-1.5">
                <input type="color" value={String(style.stroke || '#333333')} onChange={(e) => updateStyle('stroke', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5" />
                <FieldInput type="number" min="0" max="10" step="0.5" value={Number(style.strokeWidth ?? 1)}
                  onChange={(e) => updateStyle('strokeWidth', Number((e.target as HTMLInputElement).value))} className="w-16" />
              </div>
              <Select value={String(style.strokeStyle || 'solid')} onValueChange={(v) => updateStyle('strokeStyle', v)}>
                <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  <SelectItem value="solid" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Solid</SelectItem>
                  <SelectItem value="dashed" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Dashed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>
      )}

      {/* Classification */}
      <Section title="Classification" icon={<Layers size={12} />} defaultOpen={false}>
        <div className="space-y-2">
          <div>
            <FieldLabel>Category</FieldLabel>
            <Select value={obj.type} onValueChange={(v) => update({ type: v as ObjectType })}>
              <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10">
                {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-white/80 text-xs focus:bg-white/10 focus:text-white">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Layer</FieldLabel>
            <Select value={obj.layer} onValueChange={(v) => update({ layer: v as LayerType })}>
              <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10">
                {LAYER_OPTIONS.map((l) => <SelectItem key={l} value={l} className="text-white/80 text-xs focus:bg-white/10 focus:text-white">{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Z-Index</FieldLabel>
            <FieldInput type="number" value={obj.z_index} onChange={(e) => update({ z_index: Number((e.target as HTMLInputElement).value) })} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => update({ locked: !obj.locked })}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-150 ${
                obj.locked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
              {obj.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>
      </Section>

      {/* Booth Info */}
      {isBooth && booth && (
        <Section title="Booth" icon={<Store size={12} />}>
          <div className="space-y-2">
            <div>
              <FieldLabel>Booth Number</FieldLabel>
              <FieldInput
                value={booth.booth_number}
                onChange={(e) => updateBoothNumber(id, (e.target as HTMLInputElement).value)}
                className="font-mono"
              />
            </div>

            <div>
              <FieldLabel>Booth Name</FieldLabel>
              <FieldInput
                value={booth.name || ''}
                placeholder="e.g. Main Stage Booth"
                onChange={(e) => updateBoothField(id, 'name', (e.target as HTMLInputElement).value || null)}
              />
            </div>

            <div>
              <FieldLabel>Size Category</FieldLabel>
              <Select
                value={booth.size_category || ''}
                onValueChange={(v) => updateBoothField(id, 'size_category', (v || null) as BoothSizeCategory | null)}
              >
                <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  <SelectItem value="" className="text-white/80 text-xs focus:bg-white/10">— None —</SelectItem>
                  {SIZE_CATEGORIES.map((s) => (
                    <SelectItem key={s} value={s} className="text-white/80 text-xs focus:bg-white/10 focus:text-white">
                      {SIZE_CATEGORY_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FieldLabel>Price</FieldLabel>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">$</span>
                <FieldInput
                  type="number"
                  min="0"
                  step="100"
                  value={booth.price ?? ''}
                  placeholder="0"
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    updateBoothField(id, 'price', val ? Number(val) : null);
                  }}
                  className="pl-5"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex flex-wrap gap-1 mt-1">
                {BOOTH_STATUSES.map((s) => {
                  const isActive = booth.status === s;
                  return (
                    <Tooltip key={s}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => updateBoothStatus(id, s)}
                          className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all duration-150 ${
                            isActive ? 'ring-1 ring-offset-1 ring-offset-[#0a0f1a] scale-105' : 'opacity-50 hover:opacity-80'
                          }`}
                          style={{
                            backgroundColor: `${BOOTH_STATUS_BORDER[s]}20`,
                            color: BOOTH_STATUS_BORDER[s],
                            borderColor: BOOTH_STATUS_BORDER[s],
                          }}
                        >
                          {BOOTH_STATUS_LABELS[s]}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">Set status to {BOOTH_STATUS_LABELS[s]}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Exhibitor ID</FieldLabel>
              <FieldInput
                placeholder="exhibitor UUID..."
                value={booth.exhibitor_id || ''}
                onChange={(e) => updateBoothExhibitor(id, (e.target as HTMLInputElement).value || null)}
                className="font-mono"
              />
            </div>
            <div>
              <FieldLabel>Exhibitor Name</FieldLabel>
              <FieldInput
                placeholder="Company name..."
                value={String(metadata.exhibitor_name || '')}
                onChange={(e) => {
                  updateBoothExhibitor(id, booth.exhibitor_id, (e.target as HTMLInputElement).value);
                }}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Booth Profile */}
      {isBooth && booth && (
        <Section title="Booth Profile" icon={<FileText size={12} />} defaultOpen={false}>
          <div className="space-y-2">
            <div>
              <FieldLabel>Logo URL</FieldLabel>
              <FieldInput
                type="url"
                placeholder="https://..."
                value={boothProfile?.logo_url || ''}
                onChange={(e) => updateBoothProfile(id, { logo_url: (e.target as HTMLInputElement).value || null })}
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={2}
                placeholder="Booth description..."
                value={boothProfile?.description || ''}
                onChange={(e) => updateBoothProfile(id, { description: e.target.value || null })}
                className="w-full resize-none rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-150"
              />
            </div>
            <div>
              <FieldLabel>Products / Services</FieldLabel>
              <FieldInput
                placeholder="product1, product2..."
                value={Array.isArray(boothProfile?.products) ? (boothProfile.products as string[]).join(', ') : ''}
                onChange={(e) => {
                  const tags = (e.target as HTMLInputElement).value.split(',').map((t) => t.trim()).filter(Boolean);
                  updateBoothProfile(id, { products: tags });
                }}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Custom Metadata */}
      <Section title="Custom Metadata" icon={<Hash size={12} />} defaultOpen={false}>
        <div className="space-y-1">
          {Object.entries(obj.metadata || {}).filter(([k]) => !['booth_id', 'status', 'pricing_tier', 'booth_number', 'booth_status', 'exhibitor_id', 'exhibitor_name', 'boothCategory', 'sizeSqm', 'libraryItemId', '_originalStyle', '_originalType', '_originalLayer'].includes(k)).map(([key, value]) => (
            <div key={key} className="flex gap-1 items-center">
              <FieldInput value={key} readOnly className="w-20 bg-white/[0.03] text-white/40" />
              <FieldInput value={String(value ?? '')} onChange={(e) => update({ metadata: { ...obj.metadata, [key]: (e.target as HTMLInputElement).value } })} className="flex-1" />
              <button
                className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={() => { const m = { ...obj.metadata }; delete (m as Record<string, unknown>)[key]; update({ metadata: m }); }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <MetadataAdder onAdd={(key, value) => update({ metadata: { ...obj.metadata, [key]: value } })} />
        </div>
      </Section>

      {/* Cross-Floor Link */}
      <CrossFloorLinkPanel />

      {/* ID */}
      <div className="px-3 py-2 border-t border-white/5">
        <FieldLabel>Object ID</FieldLabel>
        <p className="text-[10px] text-white/30 font-mono break-all select-all">{obj.id}</p>
      </div>
    </div>
  );
}

function MetadataAdder({ onAdd }: { onAdd: (key: string, value: string) => void }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-1 mt-1">
      <FieldInput placeholder="key" value={key} onChange={(e) => setKey((e.target as HTMLInputElement).value)} className="w-20" />
      <FieldInput placeholder="value" value={value} onChange={(e) => setValue((e.target as HTMLInputElement).value)} className="flex-1" />
      <button
        className="p-1 rounded text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        onClick={() => { if (key.trim()) { onAdd(key.trim(), value); setKey(''); setValue(''); } }}
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
