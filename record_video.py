"""
Record 3-Second Motion Loop Demonstration of Titan Aerospace Operations Center
Generates both:
1. docs/videos/factory_tour.webm (native chromium webm recording)
2. docs/videos/factory_tour.gif (smooth animated looping GIF for GitHub README inline autoplay)
"""
import os
import time
import glob
from playwright.sync_api import sync_playwright
from PIL import Image

def record_motion():
    video_dir = "docs/videos"
    os.makedirs(video_dir, exist_ok=True)
    temp_frames_dir = "docs/videos/_temp_frames"
    os.makedirs(temp_frames_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--use-gl=angle", "--enable-webgl", "--force-device-scale-factor=1"]
        )
        # Configure Playwright native video recording
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=video_dir,
            record_video_size={"width": 1280, "height": 720}
        )
        page = context.new_page()
        page.goto("http://localhost:8000/")
        
        # Warm-up scene and textures
        page.wait_for_timeout(3000)
        
        # Focus on Overview / Entrance perspective
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1000)

        print("Recording 3-second motion loop (30 frames)...")
        frame_paths = []
        start_time = time.time()
        for i in range(30):
            frame_path = os.path.join(temp_frames_dir, f"frame_{i:03d}.png")
            page.screenshot(path=frame_path)
            frame_paths.append(frame_path)
            time.sleep(0.10) # 100ms interval = 3.0s total

        # Close context so Playwright finalizes the .webm video
        video_path = page.video.path()
        context.close()
        browser.close()

        # Rename Playwright output to factory_tour.webm
        target_webm = os.path.join(video_dir, "factory_tour.webm")
        if os.path.exists(target_webm):
            os.remove(target_webm)
        if os.path.exists(video_path):
            os.rename(video_path, target_webm)
            print(f"Saved Native WebM Video: {target_webm}")

        # Assemble frames into high-quality looping animated GIF
        print("Compiling animated GIF...")
        frames = [Image.open(f) for f in frame_paths]
        # Resize to 960x540 for fast loading and optimal GitHub markdown embedding
        frames_resized = [f.resize((960, 540), Image.Resampling.LANCZOS) for f in frames]
        
        gif_path = os.path.join(video_dir, "factory_tour.gif")
        frames_resized[0].save(
            gif_path,
            save_all=True,
            append_images=frames_resized[1:],
            duration=100, # 100ms per frame
            loop=0,       # Infinite loop
            optimize=True
        )
        print(f"Saved Animated GIF: {gif_path} (Size: {os.path.getsize(gif_path) // 1024} KB)")

        # Clean up temporary frames
        for f in frame_paths:
            try:
                os.remove(f)
            except OSError:
                pass
        try:
            os.rmdir(temp_frames_dir)
        except OSError:
            pass

    print("Motion recording completed successfully!")

if __name__ == "__main__":
    record_motion()
