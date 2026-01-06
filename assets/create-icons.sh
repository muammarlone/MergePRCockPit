#!/bin/bash
# Create placeholder icon files for electron-builder
# In production, these should be replaced with actual high-quality icons

# Create a simple SVG icon
cat > icon.svg << 'SVG_END'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#2563eb"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white">MP</text>
  <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="#93c5fd">Cockpit</text>
</svg>
SVG_END

echo "Icon placeholder files created. Replace with actual icons for production."
