# FloorOS Editor Redesign — PRD

## Vision
Transform the FloorOS floor plan editor from a functional but dated-looking tool into a **Figma/Miro-level polished** 2025 SaaS editor. The logic works — the UI needs to feel premium.

## Current State
- Editor exists at `/dashboard/events/[id]/editor`
- Canvas (Konva.js), toolbar, layer panel, properties panel, object library, floor panel, booth panel all functional
- Dark theme with basic glassmorphic styling already applied
- All store logic, auto-save, keyboard shortcuts working

## What Needs to Change

### 1. Layout & Structure
- **Floating toolbar** (like Figma) instead of full-width top bar
- **Collapsible side panels** with smooth animations
- **Panel tabs** redesigned as icon-only sidebar rail (like VS Code/Figma)
- **Status bar** at bottom with zoom controls, coordinates, selection info
- **Minimap** in corner (already exists but needs integration)

### 2. Visual Polish
- Deeper glassmorphism with layered backdrop-blur
- Subtle gradients on panel headers
- Micro-animations on tool selection, panel open/close
- Better color system — consistent opacity levels
- Professional typography hierarchy
- Floating tool tooltips with keyboard shortcuts styled properly

### 3. Toolbar Redesign
- Move from horizontal bar to **floating pill** centered above canvas
- Group tools visually with separators
- Active tool indicator with glow effect
- Contextual toolbar that changes based on selection

### 4. Panels Redesign
- Left: Icon rail (8px icons) → expanding panel on click
- Right: Properties panel with sections, better spacing
- Smooth slide-in/out animations
- Resizable panels (drag border)

### 5. Canvas Improvements
- Better selection indicators (rounded handles, blue accent)
- Improved grid rendering (subtle dots instead of lines at low zoom)
- Better zoom controls (bottom-left floating)
- Canvas background gradient instead of flat color

### 6. Missing UX
- Command palette (Ctrl+K)
- Better right-click context menu styling
- Toast notifications for save status
- Onboarding hints for first-time users

## Tech Stack
- Next.js 15 + App Router
- Tailwind CSS + shadcn/ui
- Konva.js for canvas
- Zustand for state
- Supabase for persistence
- Framer Motion for animations

## Phases

### Phase 1: Layout Restructure & Floating Toolbar
- Restructure editor page layout
- Create floating toolbar component
- Create icon rail sidebar
- Bottom status bar with zoom/coordinates
- **Deliverable:** New layout skeleton with existing functionality preserved

### Phase 2: Panel Redesign
- Redesign LayerPanel, PropertiesPanel, ObjectLibrary, FloorPanel, BoothPanel
- Add panel animations (framer-motion)
- Collapsible panels
- Better visual hierarchy in each panel
- **Deliverable:** All panels redesigned and functional

### Phase 3: Canvas & Interaction Polish
- Canvas background gradient
- Improved selection handles
- Better grid rendering
- Minimap integration
- Context menu redesign
- **Deliverable:** Canvas feels premium

### Phase 4: Micro-interactions & Final Polish
- Command palette (Ctrl+K)
- Toast system for save status
- Loading states and transitions
- Keyboard shortcut overlay (?)
- Final visual audit and fixes
- **Deliverable:** Ship-ready editor

## Non-Goals
- No new editor features (just visual/UX redesign)
- No backend changes
- No auth changes
- No mobile editor (desktop only for editor)

## Success Criteria
- Editor looks comparable to Figma/Miro in visual quality
- All existing functionality preserved (draw, select, move, layers, save)
- Smooth 60fps animations
- < 3s initial load time
