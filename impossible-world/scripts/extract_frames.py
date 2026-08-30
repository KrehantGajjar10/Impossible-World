import cv2
import os
import json
from PIL import Image

def extract_frames():
    video_path = 'public/video/impossible-world-4k-60fps.mp4'
    if not os.path.exists(video_path):
        video_path = 'source/impossible-world.mp4'
        if not os.path.exists(video_path):
            print(f"Error: Video file not found at either path.")
            return

    output_dir = 'public/frames'
    os.makedirs(output_dir, exist_ok=True)

    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_video_frames / fps if fps > 0 else 10.0
    
    # We want exactly 600 frames to represent the 10-second 60fps journey
    target_frame_count = min(600, total_video_frames)
    
    print(f"Video stats - Frames: {total_video_frames}, FPS: {fps}, Duration: {duration:.2f}s")
    print(f"Extracting {target_frame_count} frames...")

    extracted_count = 0
    while True:
        ret, frame = cap.read()
        if not ret or extracted_count >= target_frame_count:
            break
            
        # Convert BGR (OpenCV) to RGB (Pillow)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Resize to 1920x1080 for web efficiency
        resized_frame = cv2.resize(frame_rgb, (1920, 1080), interpolation=cv2.INTER_AREA)
        
        # Save using Pillow as webp
        img = Image.fromarray(resized_frame)
        
        # Use 1-indexed filenames (frame-0001.webp)
        filename = f"frame-{extracted_count + 1:04d}.webp"
        filepath = os.path.join(output_dir, filename)
        
        # Save with quality=80
        img.save(filepath, 'WEBP', quality=80)
        
        extracted_count += 1
        
        if extracted_count % 50 == 0:
            print(f"Extracted {extracted_count} / {target_frame_count} frames...")
            
    cap.release()
    print(f"Extraction complete. {extracted_count} frames saved to {output_dir}")
    
    # Write manifest
    manifest = {
        "frameCount": extracted_count,
        "width": 1920,
        "height": 1080,
        "fps": fps,
        "duration": duration,
        "pattern": "frame-{id}.webp"
    }
    
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Manifest written to {manifest_path}")

if __name__ == '__main__':
    extract_frames()
