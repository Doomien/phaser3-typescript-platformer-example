# Phaser 3 TypeScript Platformer

A 2D side-scrolling platformer built with **Phaser 3** and **TypeScript**, powered by **Vite**.

> Originally forked from [yandeu/phaser3-typescript-platformer-example](https://github.com/yandeu/phaser3-typescript-platformer-example). Migrated from Webpack + Phaser 3.16 to Vite + Phaser 3.80+ with a data-driven entity system.

## Quick Start

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # Production bundle → dist/
npm run preview   # Preview production build
```

## Project Structure

```
├── index.html                    # Vite entry HTML
├── vite.config.ts                # Vite config
├── tsconfig.json                 # TypeScript 5, ES2020/ESNext
├── public/
│   ├── assets/img/               # Sprite sheets & images
│   └── data/entities/            # Entity JSON files (player, bee, slime, coin, goal)
└── src/
    ├── main.ts                   # Phaser game bootstrap (Scale.FIT)
    ├── types/index.ts            # TilesConfig, MapSize, EntityData interfaces
    ├── scenes/
    │   ├── preloadScene.ts       # Asset & entity data loading
    │   └── mainScene.ts          # Game orchestration, physics, camera
    └── components/
        ├── player/player.ts      # Player sprite (data-driven from player.json)
        ├── enemies/              # BeeSprite, SlimeSprite, EnemyClass, EnemiesGroup
        ├── coins/                # CoinSingle, CoinGroup
        ├── tiles/                # TilesSingle, TilesGroup
        ├── controls/             # Touch controls (Controls, ControlsSprite)
        ├── map.ts                # Level parser (reads levels.ts)
        ├── levels.ts             # Level data (string arrays)
        ├── background.ts         # Parallax background
        ├── goalSprite.ts         # Level-end goal flag
        ├── miniMap.ts            # Mini-map camera
        └── levelText.ts          # Level number display
```

## Entity Data System

Game entities read configuration from lightweight JSON files in `public/data/entities/`. Each file follows the `EntityData` interface defined in `src/types/index.ts`:

```json
{
  "id": "bee",
  "name": "Bee",
  "category": "enemy",
  "sprite": { "key": "bee", "source": "assets/img/bee.png", "frameWidth": 128, "frameHeight": 100 },
  "animation": { "key": "fly", "startFrame": 0, "endFrame": 1, "frameRate": 8, "repeat": -1 },
  "physics": { "velocityX": -120, "bodyWidth": 80, "bodyHeight": 135 }
}
```

Components load this data via `this.scene.cache.json.get('bee-data')` after `preloadScene.ts` loads it with `this.load.json('bee-data', 'data/entities/bee.json')`.

## Tech Stack

| Tool | Version |
|------|---------|
| Phaser | 3.80+ |
| TypeScript | 5.3+ |
| Vite | 5.x |
| Node.js | 18+ |

## License

MIT
