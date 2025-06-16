#!/usr/bin/env python3
"""Generate promotional tiles for Chrome Web Store"""

import os

# Create marketing directory
os.makedirs("marketing", exist_ok=True)

# Small promo tile SVG (440x280)
small_promo_svg = '''<svg width="440" height="280" viewBox="0 0 440 280" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="440" height="280" fill="url(#gradient1)"/>
  
  <!-- Large icon -->
  <circle cx="100" cy="140" r="60" stroke="#D4722C" stroke-width="8"/>
  <circle cx="100" cy="140" r="25" fill="#D4722C"/>
  
  <!-- Text -->
  <text x="180" y="120" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="36" font-weight="bold" fill="#2C1810">Soulmark</text>
  <text x="180" y="155" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" fill="#5A3A2A">Prove You're Human</text>
  <text x="180" y="185" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" fill="#5A3A2A">Speak to Verify</text>
  <text x="180" y="220" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#8A7A6A">Combat bots with voice verification</text>
  
  <defs>
    <linearGradient id="gradient1" x1="0" y1="0" x2="440" y2="280" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF8F0"/>
      <stop offset="1" stop-color="#FFEDE0"/>
    </linearGradient>
  </defs>
</svg>'''

# Marquee promo tile SVG (1400x560)
marquee_promo_svg = '''<svg width="1400" height="560" viewBox="0 0 1400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1400" height="560" fill="url(#gradient2)"/>
  
  <!-- Background decorative circles -->
  <circle cx="200" cy="280" r="200" fill="#D4722C" opacity="0.05"/>
  <circle cx="1200" cy="280" r="150" fill="#D4722C" opacity="0.05"/>
  
  <!-- Main icon -->
  <circle cx="250" cy="280" r="100" stroke="#D4722C" stroke-width="12"/>
  <circle cx="250" cy="280" r="45" fill="#D4722C"/>
  
  <!-- Main text -->
  <text x="420" y="220" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="72" font-weight="bold" fill="#2C1810">Soulmark</text>
  <text x="420" y="280" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="36" fill="#5A3A2A">Human Verification for Social Media</text>
  
  <!-- Features -->
  <text x="420" y="350" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" fill="#5A3A2A">✓ 2-second voice verification</text>
  <text x="420" y="385" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" fill="#5A3A2A">✓ Works on X &amp; LinkedIn</text>
  <text x="420" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" fill="#5A3A2A">✓ No crypto wallets needed</text>
  
  <!-- Call to action -->
  <text x="900" y="480" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="bold" fill="#D4722C">Reclaim social media from bots</text>
  
  <!-- Decorative elements -->
  <circle cx="1100" cy="150" r="25" stroke="#D4722C" stroke-width="3" opacity="0.3"/>
  <circle cx="1100" cy="150" r="10" fill="#D4722C" opacity="0.3"/>
  <circle cx="1180" cy="200" r="25" stroke="#D4722C" stroke-width="3" opacity="0.3"/>
  <circle cx="1180" cy="200" r="10" fill="#D4722C" opacity="0.3"/>
  <circle cx="1260" cy="250" r="25" stroke="#D4722C" stroke-width="3" opacity="0.3"/>
  <circle cx="1260" cy="250" r="10" fill="#D4722C" opacity="0.3"/>
  
  <defs>
    <linearGradient id="gradient2" x1="0" y1="0" x2="1400" y2="560" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF8F0"/>
      <stop offset="0.5" stop-color="#FFEDE0"/>
      <stop offset="1" stop-color="#FFF8F0"/>
    </linearGradient>
  </defs>
</svg>'''

# Save SVG files
with open('marketing/small_promo_440x280.svg', 'w') as f:
    f.write(small_promo_svg)
print("Created marketing/small_promo_440x280.svg")

with open('marketing/marquee_promo_1400x560.svg', 'w') as f:
    f.write(marquee_promo_svg)
print("Created marketing/marquee_promo_1400x560.svg")

# Try to convert to PNG
import subprocess

conversions = [
    ('marketing/small_promo_440x280.svg', 'marketing/small_promo_440x280.png', '440x280'),
    ('marketing/marquee_promo_1400x560.svg', 'marketing/marquee_promo_1400x560.png', '1400x560')
]

for svg_file, png_file, size in conversions:
    cmd = [
        'magick', svg_file,
        '-background', 'white',
        '-alpha', 'remove',
        png_file
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Converted to {png_file}")
    except:
        # Try alternative
        alt_cmd = [
            'convert', svg_file,
            '-background', 'white', 
            '-alpha', 'remove',
            png_file
        ]
        try:
            subprocess.run(alt_cmd, check=True)
            print(f"✅ Converted to {png_file}")
        except:
            print(f"⚠️  Could not convert {svg_file} - use the HTML file or an online converter")

print("\n🎨 Marketing materials ready!")
print("- Small promo tile: marketing/small_promo_440x280.png")
print("- Marquee tile: marketing/marquee_promo_1400x560.png")
print("\nIf PNG conversion failed, open create_promo_tiles.html in a browser to download them.")