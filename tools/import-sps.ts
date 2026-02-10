import fs from 'fs';
import path from 'path';

const resolveSpsPath = (): string => {
    const explicit = process.env.SPS_ROOT
        ? path.resolve(process.env.SPS_ROOT)
        : null;
    if (explicit) return explicit;

    const kstRootCandidates = [
        process.env.KST_GAMES_ROOT ? path.resolve(process.env.KST_GAMES_ROOT) : null,
        path.resolve(process.cwd(), '..'),
        path.resolve(process.cwd(), '../..')
    ].filter((value): value is string => Boolean(value));

    for (const root of kstRootCandidates) {
        const candidate = path.join(root, 'SketchPadSurvivors');
        if (fs.existsSync(path.join(candidate, 'packs'))) {
            return candidate;
        }
    }

    return path.resolve('../SketchPadSurvivors');
};

const SPS_PATH = resolveSpsPath();
const PACKS_PATH = path.join(SPS_PATH, 'packs');
const OUTPUT_DIR = path.resolve('public/data/entities/sps');
const SYMLINK_PATH = path.resolve('public/assets/sps');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ensureSpsSymlink = () => {
    try {
        const existing = fs.lstatSync(SYMLINK_PATH);
        if (existing.isSymbolicLink()) {
            const currentTarget = fs.readlinkSync(SYMLINK_PATH);
            const resolvedTarget = path.resolve(path.dirname(SYMLINK_PATH), currentTarget);
            if (resolvedTarget === PACKS_PATH) return;
            fs.unlinkSync(SYMLINK_PATH);
        } else {
            fs.rmSync(SYMLINK_PATH, { recursive: true, force: true });
        }
    } catch (error: any) {
        if (error?.code !== 'ENOENT') throw error;
    }

    console.log(`Creating symlink from ${PACKS_PATH} to ${SYMLINK_PATH}`);
    fs.symlinkSync(PACKS_PATH, SYMLINK_PATH, 'dir');
};

if (!fs.existsSync(PACKS_PATH)) {
    throw new Error(`SketchPadSurvivors packs directory not found at ${PACKS_PATH}`);
}
ensureSpsSymlink();

interface SPSEntity {
    name: string;
    sprite?: string;
    sprites?: string[];
    animation?: { frameTime: number };
    size?: { width: number; height: number };
    stats?: any;
    xpValue?: number;
    spawnWeight?: number;
    type?: string;
}

const mapCategory = (topLevelKey: string): string => {
    if (topLevelKey === 'players') return 'character';
    if (topLevelKey === 'enemies') return 'enemy';
    if (topLevelKey === 'weapons') return 'weapon';
    if (topLevelKey === 'projectiles') return 'projectile';
    if (topLevelKey === 'collectibles') return 'collectible';
    return 'prop';
};

const packFiles: any[] = [];
const processedEntities: string[] = [];

// 2. Walk packs and convert JSONs
const packs = fs.readdirSync(PACKS_PATH).filter(f => fs.statSync(path.join(PACKS_PATH, f)).isDirectory());

packs.forEach(packName => {
    const packPath = path.join(PACKS_PATH, packName);
    const files = fs.readdirSync(packPath).filter(f => f.endsWith('.json') && f !== 'pack.json');

    files.forEach(file => {
        const filePath = path.join(packPath, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Items JSON has multiple top-level keys like "weapons", "projectiles"
            Object.keys(data).forEach(topLevelKey => {
                const category = mapCategory(topLevelKey);
                const entities = data[topLevelKey];

                if (entities && typeof entities === 'object') {
                    Object.entries(entities).forEach(([id, raw]: [string, any]) => {
                        const entity = raw as SPSEntity;
                        const entityId = `${packName}-${id}`;

                        // Normalize sprites
                        const sprites = entity.sprites || (entity.sprite ? [entity.sprite] : []);
                        if (sprites.length === 0) return;

                        // Map to EntityData format
                        const mapped = {
                            id: entityId,
                            name: `${packName} ${entity.name}`,
                            category: category,
                            sprite: {
                                key: `${entityId}-1`,
                                source: `assets/sps/${packName}/${sprites[0]}`,
                                frameWidth: entity.size?.width || 60,
                                frameHeight: entity.size?.height || 60
                            },
                            animation: sprites.length > 1 ? {
                                key: 'walk',
                                frames: sprites.map((_, i) => `${entityId}-${i + 1}`),
                                frameRate: Math.round(60 / (entity.animation?.frameTime || 8)),
                                repeat: -1
                            } : undefined,
                            physics: {
                                bodyWidth: entity.size?.width || 60,
                                bodyHeight: entity.size?.height || 60,
                                velocityX: category === 'enemy' ? -100 : 0
                            },
                            properties: {
                                ...entity.stats,
                                pack: packName,
                                originalId: id
                            }
                        };

                        const outJsonRelative = `data/entities/sps/${entityId}.json`;
                        fs.writeFileSync(path.join(OUTPUT_DIR, `${entityId}.json`), JSON.stringify(mapped, null, 2));
                        processedEntities.push(entityId);

                        // Add JSON to pack
                        packFiles.push({ type: 'json', key: `${entityId}-data`, url: outJsonRelative });

                        // Add all sprites to pack
                        sprites.forEach((spritePath, index) => {
                            const spriteKey = `${entityId}-${index + 1}`;
                            packFiles.push({
                                type: 'image',
                                key: spriteKey,
                                url: `assets/sps/${packName}/${spritePath}`
                            });
                        });

                        console.log(`Converted: ${entityId} (${sprites.length} frames)`);
                    });
                }
            });
        } catch (e) {
            console.error(`Failed to process ${filePath}:`, e);
        }
    });
});

// 3. Create the Phaser Pack File
const phaserPack = {
    sps: {
        files: packFiles
    }
};
fs.writeFileSync(path.join(OUTPUT_DIR, 'pack.json'), JSON.stringify(phaserPack, null, 2));
console.log(`Phaser pack created at ${path.join(OUTPUT_DIR, 'pack.json')}`);

// 4. Create a registry file (names only)
fs.writeFileSync(path.join(OUTPUT_DIR, 'registry.json'), JSON.stringify(processedEntities, null, 2));
