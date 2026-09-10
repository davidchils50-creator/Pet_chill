/* ===================================
   CAMERA.JS - 2D Smooth Following Camera System
   Supports Large World Scrolling & Viewport Culling
   =================================== */

export class Camera {
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.lerpSpeed = 0.08;
    }

    resize(viewportWidth, viewportHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.clamp();
    }

    setWorldSize(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.clamp();
    }

    follow(targetX, targetY, immediate = false, dtFactor = 1.0) {
        // Center the camera on the target
        this.targetX = targetX - this.viewportWidth / 2;
        this.targetY = targetY - this.viewportHeight / 2;

        if (immediate) {
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            // Smooth lerp with delta-time compensation
            const t = Math.min(1, 1 - Math.pow(1 - this.lerpSpeed, dtFactor));
            this.x += (this.targetX - this.x) * t;
            this.y += (this.targetY - this.y) * t;
        }

        this.clamp();
    }

    clamp() {
        const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
        const maxY = Math.max(0, this.worldHeight - this.viewportHeight);

        this.x = Math.max(0, Math.min(maxX, this.x));
        this.y = Math.max(0, Math.min(maxY, this.y));
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * Fast AABB frustum culling check
     * Returns true if object bounding box intersects camera view
     */
    isInView(x, y, width, height, margin = 60) {
        return (
            x + width >= this.x - margin &&
            x <= this.x + this.viewportWidth + margin &&
            y + height >= this.y - margin &&
            y <= this.y + this.viewportHeight + margin
        );
    }
}
