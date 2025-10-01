#!/bin/bash

# Script to resize video thumbnails for optimal file size and load time
# Thumbnails are displayed at 64x80px in the UI, so we resize to 128x160px (2x for retina)

THUMBNAILS_DIR="../public/videos/thumbnails"
TEMP_DIR="../public/videos/thumbnails_resized"

# Check if ImageMagick or ffmpeg is available
if ! command -v convert &> /dev/null && ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: Neither ImageMagick nor FFmpeg is installed."
    echo ""
    echo "Install one of them:"
    echo "  macOS:   brew install imagemagick"
    echo "  Linux:   sudo apt-get install imagemagick"
    echo ""
    exit 1
fi

echo "🖼️  Resizing thumbnails to 128x160px (2x retina resolution)..."
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"

# Counter for processed files
count=0

# Process each image
for img in "$THUMBNAILS_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    
    if command -v convert &> /dev/null; then
        # Use ImageMagick
        convert "$img" -resize 128x160^ -gravity center -extent 128x160 -quality 85 "$TEMP_DIR/$filename"
    else
        # Use FFmpeg
        ffmpeg -i "$img" -vf "scale=128:160:force_original_aspect_ratio=increase,crop=128:160" -q:v 3 "$TEMP_DIR/$filename" -y 2>/dev/null
    fi
    
    original_size=$(du -k "$img" | cut -f1)
    new_size=$(du -k "$TEMP_DIR/$filename" | cut -f1)
    savings=$((original_size - new_size))
    
    echo "✅ $filename: ${original_size}KB → ${new_size}KB (saved ${savings}KB)"
    ((count++))
done

if [ $count -eq 0 ]; then
    echo "❌ No images found in $THUMBNAILS_DIR"
    rmdir "$TEMP_DIR"
    exit 1
fi

echo ""
echo "📦 Total images processed: $count"
echo ""
read -p "Replace original thumbnails with resized versions? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv "$THUMBNAILS_DIR" "${THUMBNAILS_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    mv "$TEMP_DIR" "$THUMBNAILS_DIR"
    echo "✅ Thumbnails replaced! Original files backed up."
else
    rm -rf "$TEMP_DIR"
    echo "❌ Cancelled. Original thumbnails unchanged."
fi

