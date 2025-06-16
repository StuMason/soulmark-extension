#!/usr/bin/env python3
"""Generate Soulmark icons in different sizes"""

import os

# Create a simple SVG icon
svg_template = '''<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="{size}" height="{size}" fill="#FFFEF7"/>
  <circle cx="{center}" cy="{center}" r="{outer_r}" stroke="#D4722C" stroke-width="{stroke}"/>
  <circle cx="{center}" cy="{center}" r="{inner_r}" fill="#D4722C"/>
</svg>'''

sizes = [16, 48, 128]

for size in sizes:
    center = size / 2
    outer_r = size * 0.4
    inner_r = size * 0.18
    stroke = max(1.5, size * 0.08)
    
    svg_content = svg_template.format(
        size=size,
        center=center,
        outer_r=outer_r,
        inner_r=inner_r,
        stroke=stroke
    )
    
    # Save SVG file
    svg_path = f'assets/icon-{size}.svg'
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"Created {svg_path}")
    
    # Try to convert to PNG using system tools
    png_path = f'assets/icon-{size}.png'
    
    # Try different conversion methods
    conversion_commands = [
        f'rsvg-convert -w {size} -h {size} {svg_path} -o {png_path}',
        f'convert -background none -resize {size}x{size} {svg_path} {png_path}',
        f'qlmanage -t -s {size} -o assets {svg_path} && mv assets/{os.path.basename(svg_path)}.png {png_path}'
    ]
    
    for cmd in conversion_commands:
        if os.system(cmd) == 0:
            print(f"Converted to {png_path}")
            break
    else:
        print(f"Could not convert {svg_path} to PNG - you'll need to convert manually")

print("\nIcons generated! If PNG conversion failed, you can:")
print("1. Open the SVG files in any image editor and export as PNG")
print("2. Use an online converter like cloudconvert.com")
print("3. Open generate-icons.html in a browser and save the canvas images")