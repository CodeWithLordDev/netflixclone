#!/usr/bin/env python3
"""
Create minimal test video files for seeding
Requires: ffmpeg installed and in PATH
"""

import os
import subprocess
import sys

VIDEOS_DIR = os.path.join(
    os.path.dirname(__file__),
    "public",
    "videos"
)

def create_test_video(folder_path, filename, duration=3):
    """Create a simple test video file using ffmpeg"""
    output_path = os.path.join(folder_path, filename)
    
    try:
        # Command to create a simple test video
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", "color=c=blue:s=640x480:d={}".format(duration),
            "-f", "lavfi",
            "-i", "sine=f=1000:d={}".format(duration),
            "-pix_fmt", "yuv420p",
            "-y",  # Overwrite output file
            output_path
        ]
        
        print(f"📹 Creating: {output_path}")
        subprocess.run(cmd, capture_output=True, check=True)
        print(f"✅ Created: {filename}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creating {filename}: {e}")
        return False
    except FileNotFoundError:
        print("❌ ffmpeg not found. Please install ffmpeg:")
        print("   Windows: https://ffmpeg.org/download.html")
        print("   Mac: brew install ffmpeg")
        print("   Linux: sudo apt-get install ffmpeg")
        return False

def main():
    if not os.path.exists(VIDEOS_DIR):
        print(f"❌ Videos directory not found: {VIDEOS_DIR}")
        return
    
    print("🎬 Creating test video files...\n")
    
    # Define which folders need which video types
    videos_to_create = {
        "action-movie-1": "video.mp4",
        "tutorial-1": "video.webm",
    }
    
    created = 0
    failed = 0
    
    for folder, filename in videos_to_create.items():
        folder_path = os.path.join(VIDEOS_DIR, folder)
        
        if not os.path.exists(folder_path):
            print(f"⚠️  Folder not found: {folder}")
            continue
        
        if create_test_video(folder_path, filename):
            created += 1
        else:
            failed += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Created: {created}")
    print(f"   ❌ Failed: {failed}")
    
    if failed == 0 and created > 0:
        print("\n✅ Done! Now run: npm run seed:videos")

if __name__ == "__main__":
    main()
