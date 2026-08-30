export class FrameLoader {
  private cache: Map<number, HTMLImageElement> = new Map();
  private loading: Set<number> = new Set();
  private maxFrames: number;
  private basePath: string;
  private extension: string;
  
  constructor(maxFrames: number, basePath = '/frames/', extension = 'webp') {
    this.maxFrames = maxFrames;
    this.basePath = basePath;
    this.extension = extension;
  }

  private getFrameUrl(index: number): string {
    // Clamp just in case
    const safeIndex = Math.max(0, Math.min(index, this.maxFrames - 1));
    const frameNumber = safeIndex + 1;
    const paddedNumber = frameNumber.toString().padStart(4, '0');
    return `${this.basePath}frame-${paddedNumber}.${this.extension}`;
  }

  /**
   * Returns the exact frame if loaded, otherwise returns the closest loaded frame.
   * If no frames are loaded at all, returns null.
   */
  public getFrame(index: number): HTMLImageElement | null {
    if (this.cache.has(index)) {
      return this.cache.get(index)!;
    }
    
    // Find nearest loaded frame to prevent flashing
    let nearestDist = Infinity;
    let nearestImg: HTMLImageElement | null = null;
    
    for (const [loadedIndex, img] of this.cache.entries()) {
      const dist = Math.abs(loadedIndex - index);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestImg = img;
      }
    }
    
    return nearestImg;
  }

  /**
   * Loads a frame if not already loaded or loading.
   */
  public prioritizeFrame(index: number): void {
    if (index < 0 || index >= this.maxFrames) return;
    if (this.cache.has(index) || this.loading.has(index)) return;
    
    this.loadImage(index);
  }

  /**
   * Queue frames based on current focus and scroll direction
   */
  public loadSurroundingFrames(centerIndex: number, radius = 5, direction: number = 1): void {
    // If direction is positive, prioritize forward frames. If negative, backward frames.
    for (let i = 1; i <= radius; i++) {
      this.prioritizeFrame(centerIndex + (i * direction));
      // Load the opposite direction with lower priority (later in the loop)
      this.prioritizeFrame(centerIndex - (i * direction));
    }
  }

  private loadImage(index: number): Promise<void> {
    return new Promise((resolve) => {
      this.loading.add(index);
      const img = new Image();
      const url = this.getFrameUrl(index);
      
      img.onload = () => {
        this.cache.set(index, img);
        this.loading.delete(index);
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load frame: ${url}`);
        this.loading.delete(index);
        resolve();
      };
      
      img.src = url;
    });
  }

  /**
   * Preload critical opening frames immediately.
   */
  public async initialize(initialBatch = 10): Promise<void> {
    const promises: Promise<void>[] = [];
    const endIndex = Math.min(initialBatch, this.maxFrames);
    
    for (let i = 0; i < endIndex; i++) {
      if (!this.cache.has(i)) {
        promises.push(this.loadImage(i));
      }
    }
    
    await Promise.all(promises);
    
    // Start background loading for the rest, sequentially so we don't spam network
    this.backgroundLoadSequential();
  }
  
  private async backgroundLoadSequential() {
    // Load remaining frames chunk by chunk
    for (let i = 0; i < this.maxFrames; i++) {
      if (!this.cache.has(i) && !this.loading.has(i)) {
        await this.loadImage(i);
      }
    }
  }
}
