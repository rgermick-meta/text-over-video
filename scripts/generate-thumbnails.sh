#!/bin/bash

# Script to generate thumbnails for all videos
# Usage: ./scripts/generate-thumbnails.sh

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install it first:"
    echo "   macOS: brew install ffmpeg"
    echo "   Linux: sudo apt-get install ffmpeg"
    exit 1
fi

# Navigate to the videos directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VIDEO_DIR="$SCRIPT_DIR/../public/videos"
THUMB_DIR="$VIDEO_DIR/thumbnails"

cd "$VIDEO_DIR" || exit 1

echo "🎬 Generating thumbnails for all videos..."
echo ""

# Create thumbnails directory if it doesn't exist
mkdir -p "$THUMB_DIR"

# Counter for generated thumbnails
count=0

# Loop through all MP4 files
for video in *.mp4; do
    # Skip if no mp4 files found
    if [ ! -f "$video" ]; then
        continue
    fi
    
    # Get filename without extension
    filename="${video%.mp4}"
    thumbnail="$THUMB_DIR/${filename}.jpg"
    
    # Skip if thumbnail already exists
    if [ -f "$thumbnail" ]; then
        echo "⏭️  Skipping $filename (thumbnail already exists)"
        continue
    fi
    
    echo "📸 Generating thumbnail for: $filename"
    
    # Generate thumbnail at 1 second into the video
    # -ss: seek to position (1 second)
    # -vframes 1: extract only 1 frame
    # -q:v 2: high quality (2 is best, 31 is worst)
    ffmpeg -i "$video" -ss 00:00:01 -vframes 1 -q:v 2 "$thumbnail" -y 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Created: ${filename}.jpg"
        ((count++))
    else
        echo "❌ Failed to create thumbnail for: $filename"
    fi
    echo ""
done

echo "🎉 Done! Generated $count thumbnail(s)."

