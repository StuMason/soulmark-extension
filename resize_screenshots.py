#!/usr/bin/env python3
"""Resize screenshots for Chrome Web Store"""

import os
import subprocess

# Define input and output directories
input_dir = "resize"
output_dir = "screenshots"

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Get all PNG files
screenshots = [f for f in os.listdir(input_dir) if f.endswith('.png')]

# Process each screenshot
for i, screenshot in enumerate(screenshots[:5]):  # Max 5 screenshots
    input_path = os.path.join(input_dir, screenshot)
    
    # Determine output size based on index
    # First 4 images: 1280x800, last one: 640x400
    if i < 4:
        size = "1280x800"
        output_name = f"screenshot_{i+1}_1280x800.png"
    else:
        size = "640x400"
        output_name = f"screenshot_{i+1}_640x400.png"
    
    output_path = os.path.join(output_dir, output_name)
    
    # ImageMagick command to resize and remove alpha channel
    # -resize fits image within dimensions maintaining aspect ratio
    # -gravity center centers the image
    # -background white adds white background
    # -extent forces exact dimensions
    # -alpha remove removes alpha channel
    cmd = [
        "magick", input_path,
        "-resize", size,
        "-gravity", "center",
        "-background", "white",
        "-extent", size,
        "-alpha", "remove",
        output_path
    ]
    
    print(f"Resizing {screenshot} to {size}...")
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Created {output_path}")
    except subprocess.CalledProcessError:
        print(f"❌ Failed to resize {screenshot}")
        # Try alternative command
        alt_cmd = [
            "convert", input_path,
            "-resize", size,
            "-gravity", "center",
            "-background", "white",
            "-extent", size,
            "-alpha", "remove",
            output_path
        ]
        try:
            subprocess.run(alt_cmd, check=True)
            print(f"✅ Created {output_path} (using convert)")
        except:
            print(f"❌ Could not resize {screenshot}")

print(f"\n✨ Screenshots ready in '{output_dir}' directory!")
print("Upload these to Chrome Web Store:")
for f in os.listdir(output_dir):
    if f.endswith('.png'):
        print(f"  - {f}")