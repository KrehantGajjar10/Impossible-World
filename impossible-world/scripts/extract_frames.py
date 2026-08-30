import cv2
import os
import json
import time

def extract_frames(video_path, output_dir, target_width=1920, target_height=1080, webp_quality=80):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    # Original metadata
    orig_fps = cap.get(cv2.CAP_PROP_FPS)
    orig_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = orig_count / orig_fps if orig_fps > 0 else 0

    print(f"Original Metadata: {orig_width}x{orig_height}, {orig_fps} FPS, {orig_count} frames, {duration:.2f}s")
    print(f"Extracting to: {output_dir}")
    print(f"Target Resolution: {target_width}x{target_height}, Format: WebP (Quality: {webp_quality})")

    frame_count = 0
    start_time = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Resize frame
        resized = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)
        
        # Save as WebP
        # 1-indexed numbering as per common practice
        frame_idx = frame_count + 1 
        filename = f"frame-{frame_idx:04d}.webp"
        filepath = os.path.join(output_dir, filename)
        
        cv2.imwrite(filepath, resized, [cv2.IMWRITE_WEBP_QUALITY, webp_quality])
        
        frame_count += 1
        
        if frame_count % 24 == 0:
            print(f"Processed {frame_count}/{orig_count} frames...")

    cap.release()
    end_time = time.time()
    print(f"Extraction complete! Extracted {frame_count} frames in {end_time - start_time:.2f} seconds.")

    # Create Manifest
    manifest = {
        "originalVideo": video_path,
        "originalResolution": {"width": orig_width, "height": orig_height},
        "originalFPS": orig_fps,
        "originalDuration": duration,
        "originalFrameCount": orig_count,
        "outputResolution": {"width": target_width, "height": target_height},
        "extractedFrameCount": frame_count,
        "samplingFPS": orig_fps, # Keeping 1:1 ratio
        "format": "webp",
        "quality": webp_quality,
        "namingPattern": "frame-XXXX.webp"
    }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Manifest written to {manifest_path}")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    VIDEO_FILE = os.path.join(BASE_DIR, "source", "impossible-world.mp4")
    OUTPUT_DIR = os.path.join(BASE_DIR, "public", "frames")
    extract_frames(VIDEO_FILE, OUTPUT_DIR)
