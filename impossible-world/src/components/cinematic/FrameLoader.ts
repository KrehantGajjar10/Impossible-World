export class FrameLoader {
  private cache: Map<number, HTMLImageElement> = new Map();
  private maxFrames: number;
  private basePath: string;
  private extension: string;
  
  constructor(maxFrames: number, basePath = '/frames/', extension = 'webp') {
    this.maxFrames = maxFrames;
    this.basePath = basePath;
    this.extension = extension;
  }

  /**
   * Generates the URL for a specific frame index
   * Note: The frames are 1-indexed (frame-0001 to frame-0240)
   * The index parameter is 0-indexed (0 to 239)
   */
  private getFrameUrl(index: number): string {
    const frameNumber = index + 1; // 1-indexed file names
    const paddedNumber = frameNumber.toString().padStart(4, '0');
    return `${this.basePath}frame-${paddedNumber}.${this.extension}`;
  }

  /**
   * Gets a frame from cache, or returns null if not loaded
   */
  public getFrame(index: number): HTMLImageElement | null {
    return this.cache.get(index) || null;
  }

  /**
   * Preloads a sequence of frames and returns a Promise that resolves when done.
   */
  public async preloadSequence(startIndex: number, count: number): Promise<void> {
    const promises: Promise<void>[] = [];
    const endIndex = Math.min(startIndex + count, this.maxFrames);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.cache.has(i)) {
        promises.push(this.loadImage(i));
      }
    }
    
    await Promise.all(promises);
  }

  /**
   * Internal method to load a single image
   */
  private loadImage(index: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = this.getFrameUrl(index);
      
      img.onload = () => {
        this.cache.set(index, img);
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load frame: ${url}`);
        resolve(); // Resolve anyway to not break Promise.all
      };
      
      img.src = url;
    });
  }

  /**
   * Preload critical frames immediately, then lazy load the rest.
   */
  public async initialize(initialBatch = 24): Promise<void> {
    // 1. Wait for the initial batch (e.g., first second of video)
    await this.preloadSequence(0, initialBatch);
    
    // 2. Start lazy loading the rest without blocking
    this.preloadSequence(initialBatch, this.maxFrames - initialBatch).catch(console.error);
  }
}
