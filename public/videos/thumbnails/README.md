# Video Thumbnails

This folder contains thumbnail images for your videos. Thumbnails should match the video filenames with a `.jpg` extension.

## Optimal Size for Performance
- **Display size in UI:** 64×80px
- **Recommended saved size:** 128×160px (2x for retina displays)
- **Format:** JPG (quality 85)
- **Expected file size:** 5-15KB per thumbnail (much smaller than 500KB!)

## Quick Resize (If thumbnails are too large)
```bash
cd ../../scripts
chmod +x resize-thumbnails.sh
./resize-thumbnails.sh
```

## How to Create Thumbnails

### Method 1: Using FFmpeg (Recommended - Optimized Size)
Install FFmpeg if you don't have it: `brew install ffmpeg` (on macOS)

```bash
# Generate optimized thumbnail (128x160px, 9:16 aspect)
ffmpeg -i "Video Name.mp4" -ss 00:00:01 -vf "scale=128:160:force_original_aspect_ratio=increase,crop=128:160" -frames:v 1 -q:v 3 "Video Name.jpg"
```

### Method 2: Quick Batch Script (All videos at once)
```bash
cd /path/to/Video+Text/public/videos
for video in *.mp4; do
  ffmpeg -i "$video" -ss 00:00:01 -vf "scale=128:160:force_original_aspect_ratio=increase,crop=128:160" -frames:v 1 -q:v 3 "thumbnails/${video%.mp4}.jpg"
done
```

### Method 3: Using ImageMagick
```bash
# Resize existing large thumbnails
convert "Large Thumbnail.jpg" -resize 128x160^ -gravity center -extent 128x160 -quality 85 "Optimized Thumbnail.jpg"
```

### Method 4: Manual Screenshot
1. Open the video in QuickTime Player or VLC
2. Pause at a good frame
3. Take a screenshot
4. Resize to 128×160px using Preview or any image editor
5. Save as JPG with quality 85

## Naming Convention
- Video: `Alien.mp4` → Thumbnail: `Alien.jpg`
- Video: `Feeling myself.mp4` → Thumbnail: `Feeling myself.jpg`

## Image Specifications
- **Format:** JPG
- **Aspect Ratio:** 9:16 (portrait/vertical)
- **Dimensions:** 128×160px (perfect for UI at 64×80px display size)
- **Quality:** 85
- **File Size:** 5-15KB per image

## Fallback Behavior
If a thumbnail image is missing or fails to load, the video picker will automatically fall back to showing a frame from the video itself.

