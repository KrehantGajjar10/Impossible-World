export class FrameLoader {
  private totalFrames: number;
  private cache: Map<number, HTMLImageElement> = new Map();
  private loadQueue: Set<number> = new Set();
  private loading: Set<number> = new Set();
  
  // Smart preloading config
  private MAX_CACHE_SIZE = 400; // Prevent memory exhaustion
  private PRELOAD_RADIUS_FORWARD = 25;
  private PRELOAD_RADIUS_BACKWARD = 10;
  
  constructor(totalFrames: number) {
    this.totalFrames = totalFrames;
  }

  // Preload the first batch of frames for instant start
  public async initialize(initialCount: number = 30): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < initialCount; i++) {
      if (i < this.totalFrames) {
        promises.push(this.loadFrame(i));
      }
    }
    await Promise.all(promises);
  }

  // Get a frame, or the closest available loaded frame if the exact one is missing
  public getClosestFrame(targetIndex: number): HTMLImageElement | null {
    if (this.cache.has(targetIndex)) {
      return this.cache.get(targetIndex)!;
    }

    // Fallback: search outward for the closest loaded frame
    let offset = 1;
    while (offset < 50) {
      if (targetIndex - offset >= 0 && this.cache.has(targetIndex - offset)) {
        return this.cache.get(targetIndex - offset)!;
      }
      if (targetIndex + offset < this.totalFrames && this.cache.has(targetIndex + offset)) {
        return this.cache.get(targetIndex + offset)!;
      }
      offset++;
    }

    return null; // Should only happen if completely unloaded
  }

  // Called every rAF to update the priority queue based on scroll direction
  public updatePreloadQueue(targetIndex: number, direction: number) {
    this.loadQueue.clear();

    const forwardRadius = direction >= 0 ? this.PRELOAD_RADIUS_FORWARD : this.PRELOAD_RADIUS_BACKWARD;
    const backwardRadius = direction < 0 ? this.PRELOAD_RADIUS_FORWARD : this.PRELOAD_RADIUS_BACKWARD;

    const start = Math.max(0, targetIndex - backwardRadius);
    const end = Math.min(this.totalFrames - 1, targetIndex + forwardRadius);

    // Prioritize loading exactly in the direction we are moving
    if (direction >= 0) {
      for (let i = targetIndex; i <= end; i++) this.queueFrame(i);
      for (let i = targetIndex - 1; i >= start; i--) this.queueFrame(i);
    } else {
      for (let i = targetIndex; i >= start; i--) this.queueFrame(i);
      for (let i = targetIndex + 1; i <= end; i++) this.queueFrame(i);
    }

    this.processQueue();
    this.enforceCacheLimit(targetIndex);
  }

  private queueFrame(index: number) {
    if (!this.cache.has(index) && !this.loading.has(index)) {
      this.loadQueue.add(index);
    }
  }

  private async processQueue() {
    // Boosted concurrency to 10 to handle rapid scrolling without stalling the sequence.
    const CONCURRENT_LOADS = 10;
    
    while (this.loading.size < CONCURRENT_LOADS && this.loadQueue.size > 0) {
      const nextIndex = this.loadQueue.values().next().value;
      if (nextIndex !== undefined) {
        this.loadQueue.delete(nextIndex);
        this.loadFrame(nextIndex); // fire and forget
      }
    }
  }

  private loadFrame(index: number): Promise<void> {
    if (this.cache.has(index)) return Promise.resolve();
    
    this.loading.add(index);
    
    return new Promise((resolve) => {
      const img = new Image();
      // Use 1-indexed format frame-0001.webp
      const paddedIndex = String(index + 1).padStart(4, '0');
      img.src = `/frames/frame-${paddedIndex}.webp`;
      
      img.onload = () => {
        this.cache.set(index, img);
        this.loading.delete(index);
        this.processQueue();
        resolve();
      };
      
      img.onerror = () => {
        this.loading.delete(index);
        this.processQueue();
        resolve(); // Don't throw, just skip
      };
    });
  }

  private enforceCacheLimit(currentIndex: number) {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Delete frames furthest away from current index
    const sortedKeys = Array.from(this.cache.keys()).sort(
      (a, b) => Math.abs(b - currentIndex) - Math.abs(a - currentIndex)
    );

    const toRemove = this.cache.size - this.MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(sortedKeys[i]);
    }
  }
}
