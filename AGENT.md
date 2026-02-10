# AGENT.md — Platformer Agent Context

> **Last Updated:** February 9, 2026
> **Current State:** Post-migration, stable

## Project Overview

A 2D side-scrolling platformer built with Phaser 3 + TypeScript + Vite. Uses a data-driven entity system where game objects read configuration from static JSON files rather than hardcoding values.

**Related projects:**
- [EntityManager](file:///Users/isvahanodonnell/Documents/GitHub/EntityManager) — Web-based entity authoring tool (future data source)
- [gdm](file:///Users/isvahanodonnell/Documents/GitHub/gdm) — Game Data Management schemas and tooling

---

## Commands

```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npx tsc --noEmit  # Type-check without emitting
```

---

## Architecture

### Entry Flow
`index.html` → `src/main.ts` → `PreloadScene` (loads assets + JSON) → `MainScene` (game loop)

### Scaling
Phaser `Scale.FIT` with `Scale.CENTER_BOTH` — no manual resize logic. UI element repositioning handled via `scale.on('resize')` in `mainScene.ts`.

### Entity Data Pattern
Components read from Phaser's JSON cache at construction time:
```typescript
const data = scene.cache.json.get('bee-data') as EntityData;
const anim = data.animation!;
body.setVelocityX(data.physics!.velocityX ?? -120);
```

JSON files live in `public/data/entities/` and are loaded in `preloadScene.ts`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Phaser config, scene registration |
| `src/types/index.ts` | `TilesConfig`, `MapSize`, `EntityData` interfaces |
| `src/scenes/preloadScene.ts` | Asset loading (images, spritesheets, entity JSONs) |
| `src/scenes/mainScene.ts` | Game loop, physics colliders, camera, UI |
| `src/components/player/player.ts` | Player movement, animation, entity-data-driven physics |
| `src/components/enemies/` | `BeeSprite`, `SlimeSprite`, `EnemyClass`, `EnemiesGroup` |
| `src/components/map.ts` | Level parser — maps characters to tile/entity types |
| `src/components/levels.ts` | Level layout data (string arrays) |

---

## Entity JSON Files

Located in `public/data/entities/`:

| File | Category | Key Properties |
|------|----------|----------------|
| `player.json` | character | speed, jumpVelocity, bounceVelocity, body dimensions |
| `bee.json` | enemy | velocityX, fly animation, body size |
| `slime.json` | enemy | velocityX, crawl animation (yoyo) |
| `coin.json` | collectible | spin animation frameRate |
| `goal.json` | prop | sprite info only |

Schema: `EntityData` interface in `src/types/index.ts`.

---

## Conventions

- **ESM imports** — All files use `import Phaser from 'phaser'` (not global namespace)
- **No `@ts-ignore`** — Proper type casts (`body as Phaser.Physics.Arcade.Body`) used throughout
- **Data-driven fallbacks** — Entity properties use nullish coalescing: `physics.velocityX ?? -120`
- **Component pattern** — Game objects extend `Phaser.Physics.Arcade.Sprite` or `Phaser.GameObjects.*`

---

## Migration History

Migrated from Webpack + Phaser 3.16 + Spine in February 2026. Key changes:
- Spine plugin completely removed; player uses sprite sheet animation
- Manual canvas resize replaced with Phaser Scale Manager
- Global type declarations (`typings/`) replaced with proper module types
- Hardcoded entity values extracted to JSON files
- PWA/service worker removed

See [MIGRATION_GUIDE.md](file:///Users/isvahanodonnell/Documents/GitHub/platformer/MIGRATION_GUIDE.md) for the original migration plan.
