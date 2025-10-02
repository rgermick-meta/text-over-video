# Video+Text: TikTok-Style Video Editor 🎬✨

A mobile-first video editor that allows you to add and style text overlays on videos with custom presets. Built with React, TypeScript, and Tailwind CSS.

![Project Preview](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.13-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Features

- 🎥 **Video Player**: Looping MP4 video player with mobile-optimized 9:16 aspect ratio
- ✨ **Text Overlays**: Add and customize text with advanced styling options
- 🎨 **Style Presets**: Built-in and custom text style presets with save/import/export
- 🔤 **Rich Text Editing**: Font families, sizes, colors, gradients, shadows, strokes
- 📋 **Preset Management**: Save your favorite text styles and share them as JSON
- 🔄 **Live Preview**: See changes in real-time as you edit
- 📱 **Mobile-First**: Responsive design optimized for mobile viewing
- 💾 **Local Storage**: Custom presets saved automatically in browser

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **@rive-app/react-canvas** - Rive animation integration
- **Tailwind CSS** - Styling and responsive design

## Project Structure

```
Video+Text/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.tsx    # Video player with text overlays
│   │   ├── TextEditor.tsx     # Text editing and styling controls
│   │   ├── StylePicker.tsx    # Animation style selector
│   │   └── VideoPicker.tsx    # Video selection interface
│   ├── data/
│   │   └── animations.ts      # Sample videos data
│   ├── utils/
│   │   ├── googleFonts.ts     # Font and preset definitions
│   │   └── presetManager.ts   # LocalStorage preset management
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles with Tailwind
├── public/
│   └── videos/                # Video files and thumbnails
├── PRESET_SCHEMA.md           # Preset JSON schema documentation
├── sample-presets.json        # Example preset collection
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Basic knowledge of React and TypeScript

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## How It Works

### Video Layer
- Uses a standard HTML5 `<video>` element
- Configured to autoplay, loop, and mute for seamless playback
- Maintains 9:16 aspect ratio for mobile-first experience

### Rive Overlay
- Positioned absolutely over the video using CSS
- Configured with transparent background
- Uses `@rive-app/react-canvas` for optimal performance
- Automatically plays and loops with the video

### Style Picker
- Horizontal scrollable container with animation thumbnails
- Visual feedback for selected animation (pink ring + checkmark)
- Smooth transitions when switching animations
- Hides scrollbar for cleaner mobile UI

## Customization

### Working with Text Style Presets

#### Save Custom Presets
1. Style your text with the desired settings
2. Click "Save Current Style as Preset"
3. Enter a name and category for your preset
4. Click "Save" - your preset is now available in the presets list

#### Export Presets
1. Click the Import/Export button (download icon)
2. Click "Export All" to download your custom presets as JSON
3. The file will be saved as `text-presets-[timestamp].json`
4. Share this file with others or keep as backup

#### Import Presets
1. Click the Import/Export button
2. Click "Import" and select a JSON file
3. New presets will be added; duplicates are skipped
4. See `sample-presets.json` for example preset collections

For detailed information about the preset JSON schema, see [PRESET_SCHEMA.md](PRESET_SCHEMA.md).

### Adding Videos

Place video files in the `public/videos/` directory and update `src/data/animations.ts`:

```typescript
export const SAMPLE_VIDEOS: VideoClip[] = [
  {
    id: 'my-video',
    name: 'My Video',
    src: '/videos/my-video.mp4',
    thumbnail: '/videos/thumbnails/my-video.jpg',
  },
  // Add more videos...
];
```

### Styling

The project uses Tailwind CSS for styling. Modify:
- `tailwind.config.js` for theme customization
- Component class names for specific styling
- `src/index.css` for global styles

## Key Implementation Details

### VideoPlayer Component
- Manages both video and Rive canvas rendering
- Handles autoplay for both layers
- Responds to animation changes
- Includes TikTok-style UI overlays

### StylePicker Component
- Renders thumbnails in a horizontal scroll container
- Highlights selected animation
- Emits selection events to parent component

### Type Safety
- Full TypeScript support
- Custom interfaces for Rive animations
- Proper prop typing for all components

## Browser Compatibility

- ✅ Chrome/Edge (90+)
- ✅ Safari (14+)
- ✅ Firefox (88+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Optimize Rive Files**: Keep Rive files small (< 1MB recommended)
2. **Video Compression**: Use compressed MP4 files for faster loading
3. **Lazy Loading**: Consider lazy loading animations not immediately visible
4. **Caching**: Implement service workers for offline capability

## Known Limitations

- Requires internet connection for CDN-hosted Rive files
- Video autoplay may require user interaction on some browsers
- Performance depends on device capabilities for simultaneous playback

## Future Enhancements

- [x] Text style presets with save/import/export
- [x] LocalStorage persistence for custom presets
- [ ] Cloud storage for presets and projects
- [ ] Export composed videos with text overlays
- [ ] Preset sharing marketplace
- [ ] Animation timing controls for text
- [ ] Multiple text layers with z-index control
- [ ] Video trimming and editing

## Resources

- [Rive Community](https://rive.app/community) - Free animations
- [Rive Documentation](https://rive.app/docs) - Official docs
- [React Rive](https://github.com/rive-app/rive-react) - React integration

## License

MIT License - feel free to use this project for learning and commercial purposes.

## Credits

- Sample video: [Big Buck Bunny](https://peach.blender.org/) by Blender Foundation
- Rive animations: [Rive Community](https://rive.app/community)
- Built with ❤️ using React, TypeScript, and Rive

---

**Note**: This is a prototype/demo application. For production use, consider adding error handling, loading states, and accessibility features.

