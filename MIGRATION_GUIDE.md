# Platformer Migration Guide

This guide details how to migrate the `platformer` project from its current **Webpack + Phaser 3.16** setup to a modern **Vite + Phaser 3.80+ + TypeScript** stack, similar to the `HiOrbit_game` refactor.

## 1. Prerequisites & Scaffolding

1.  **Backup**: Ensure your current state is committed to git.
2.  **Initialize Vite Project**:
    ```bash
    # Run in the root of platformer
    npm create vite@latest . -- --template vanilla-ts
    ```
    *Select "Yes" to overwrite files if prompted (be careful with existing source, backing up `src/` first is wise).*

3.  **Update `package.json`**:
    Replace dependencies with modern versions:
    ```json
    "dependencies": {
      "phaser": "^3.80.1"
      // "nanoid": "^5.0.0" (Optional, if you need UUIDs)
    },
    "devDependencies": {
      "typescript": "^5.3.3",
      "vite": "^5.0.0",
      "@types/node": "^20.0.0"
    }
    ```

4.  **Install Dependencies**:
    ```bash
    npm install
    ```

## 2. Asset Migration

Vite serves static assets from the `public/` directory.

1.  **Create Directory**: `mkdir -p public/assets`
2.  **Move Assets**:
    Move everything from `src/assets/` to `public/assets/`.
    ```bash
    mv src/assets/* public/assets/
    rm -rf src/assets
    ```
3.  **Refactor**:
    In `src/scenes/preloadScene.ts`, update load paths to be relative to root:
    ```typescript
    // Old
    this.load.image(img, `assets/img/${img}.png`)
    
    // New (Vite serves public/ at root)
    this.load.image(img, `assets/img/${img}.png`) 
    // This actually stays the same string! But the file location changed.
    ```

## 3. Code Refactoring

### A. Configuration (`src/main.ts`)
Replace the complex `src/game.ts` manual resizing logic with Phaser's built-in Scale Manager.

**Delete `src/game.ts`** and create **`src/main.ts`**:

```typescript
import { Game, Scale, Types } from 'phaser';
import MainScene from './scenes/mainScene';
import PreloadScene from './scenes/preloadScene';
// Keep the plugin import if you retain the file, or see Section 4
import SpineWebGLPlugin from './plugins/SpineWebGLPlugin'; 

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'app', // Ensure index.html has <div id="app"></div>
    backgroundColor: '#ade6ff',
    scale: {
        mode: Scale.FIT, // This replaces the manual resize() logic
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2500 },
            debug: false
        }
    },
    plugins: {
       scene: [{ key: 'SpineWebGLPlugin', plugin: SpineWebGLPlugin, start: true, sceneKey: 'spine' }]
    },
    scene: [PreloadScene, MainScene]
};

new Game(config);
```

### B. Index HTML (`index.html`)
Update to point to the new entry point:
```html
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
</body>
```

### C. Scenes & Components
Most logic in `src/scenes/` and `src/components/` should work as-is.
- **Fix Imports**: Ensure imports don't reference `src/assets`.
- **Resize Listeners**: `MainScene` had manual resize listeners (`this.scale.on('resize', ...)`). formatting
    - With `Scale.FIT`, the canvas resizes automatically.
    - However, UI elements (controls, version text) might need re-positioning.
    - Keep the `resize()` method in `MainScene` but trigger it on `this.scale.on('resize', ...)` which Phaser fires on window resize.

## 4. Handling Spine Plugin

The project uses a legacy `SpineWebGLPlugin` in `src/plugins/`. 
- **Option A (Safest)**: Keep the `src/plugins/` folder and `SpineWebGLPlugin.js`.
    - You might need to add `allowJs: true` to `tsconfig.json`.
- **Option B (Modern)**: Upgrade to the official `@esotericsoftware/spine-phaser` runtime.
    - Requires rewriting asset loading (`this.load.spine(...)` -> `this.load.spineBinary(...)`).
    - Recommended for long-term health but higher effort.

## 5. Clean Up

Remove Webpack artifacts:
```bash
rm -rf webpack/
rm webpack.config.js # if exists
```

## 6. Run & Verify

```bash
npm run dev
```

Check `localhost:5173`. 
- If you see a black screen, check the Console for asset 404s.
- If Spine animations fail, debug the Plugin import path.

## 7. Entity Structure Migration (Recommended)

To match the data-driven architecture of `HiOrbit_game`, you should extract entity definitions into external JSON files.

### A. Create Data Structure
Create a `public/data/entities/` directory.

### B. Extract Entities
Create individual JSON files for your game objects.

**`public/data/entities/player.json`**
```json
{
  "id": "player",
  "name": "Player",
  "category": "character",
  "sprite": {
    "source": "assets/img/player.png",
    "frameWidth": 120,
    "frameHeight": 165
  },
  "properties": [
    { "id": "speed", "type": "float", "value": 200 }
  ]
}
```

**`public/data/entities/slime.json`**
```json
{
  "id": "slime",
  "name": "Slime",
  "category": "enemy",
  "sprite": {
    "source": "assets/img/slime.png",
    "frameWidth": 112,
    "frameHeight": 68
  }
}
```

Repeat for `bee`, `coin`, and `goal`.

### C. Update Loader
In `src/scenes/preloadScene.ts`, load these JSONs:
```typescript
preload() {
    // ... existing loads ...
    this.load.json('player-data', 'data/entities/player.json');
    this.load.json('slime-data', 'data/entities/slime.json');
}
```

### D. Use Data in Game
Refactor `src/components/map.ts` or `mainScene.ts` to read properties from the cache instead of hardcoded values:
```typescript
// Example usage
const playerData = this.cache.json.get('player-data');
const speed = playerData.properties.find(p => p.id === 'speed').value;
```
