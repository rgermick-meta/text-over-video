# Video Clips Folder

Place your video clips in this folder to use them in the editor.

## Supported Formats
- MP4 (recommended)
- WebM
- MOV
- OGG

## Tips
- Use MP4 format for best browser compatibility
- 9:16 aspect ratio (portrait/vertical) works best for mobile-style videos
- Keep file sizes reasonable for web playback
- Name your files descriptively (e.g., `sunset-beach.mp4`, `city-timelapse.mp4`)

## Adding Thumbnails (Optional but Recommended)

For better performance, add thumbnail images in the `thumbnails/` folder:

### Quick Method with FFmpeg:
```bash
# Install FFmpeg first: brew install ffmpeg
# Then run the script:
./scripts/generate-thumbnails.sh
```

### Manual Method:
1. Open your video in QuickTime, VLC, or any video player
2. Pause at a good frame
3. Take a screenshot
4. Save as `thumbnails/VideoName.jpg` (matching your video filename)

**Note:** If thumbnails are missing, the app will automatically use video frames as fallback.

