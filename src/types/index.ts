export interface TilesConfig {
    type: string;
    texture: string;
    x: number;
    y: number;
}

export interface MapSize {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Lightweight entity JSON shape consumed from public/data/entities/*.json */
export interface EntityData {
    id: string;
    name: string;
    category: 'character' | 'enemy' | 'collectible' | 'weapon' | 'projectile' | 'prop';
    sprite: {
        key: string;
        source: string;
        frameWidth: number;
        frameHeight: number;
    };
    animation?: {
        key: string;
        frames?: string[];
        startFrame?: number;
        endFrame?: number;
        frameRate?: number;
        repeat?: number;
        yoyo?: boolean;
    };
    physics?: {
        velocityX?: number;
        bodyWidth?: number;
        bodyHeight?: number;
        bodyOffsetX?: number;
        bodyOffsetY?: number;
        originX?: number;
        originY?: number;
        dragX?: number;
    };
    properties?: Record<string, string | number | boolean>;
}
