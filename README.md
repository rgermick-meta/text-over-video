# TikTok-Style Video Player with Rive Animations 🎬✨

A mobile-first video player prototype that demonstrates layering interactive Rive animations on top of video content with a swipeable style picker. Built with React, TypeScript, and Rive.

![Project Preview](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.13-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Features

- 🎥 **Video Player**: Looping MP4 video player with mobile-optimized 9:16 aspect ratio
- ✨ **Rive Overlay**: Transparent Rive animation canvas layered on top of video
- 🎨 **Style Picker**: Horizontal scrollable gallery with thumbnail previews
- 🔄 **Live Switching**: Seamlessly swap between different Rive animations
- 📱 **Mobile-First**: Responsive design optimized for mobile viewing
- 🎭 **Simultaneous Playback**: Video and Rive animations play together in sync

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
│   │   ├── VideoPlayer.tsx    # Main player with video + Rive overlay
│   │   └── StylePicker.tsx    # Horizontal scrollable animation selector
│   ├── data/
│   │   └── animations.ts      # Sample Rive animations data
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles with Tailwind
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

### Adding Your Own Rive Animations

Edit `src/data/animations.ts`:

```typescript
export const SAMPLE_ANIMATIONS: RiveAnimation[] = [
  {
    id: 'my-animation',
    name: 'My Animation',
    src: 'https://your-rive-url.riv',
    thumbnail: 'https://your-thumbnail.png',
    stateMachine: 'State Machine 1', // Optional
  },
  // Add more animations...
];
```

### Changing the Video

Update the video URL in `src/data/animations.ts`:

```typescript
export const SAMPLE_VIDEO_URL = 'https://your-video-url.mp4';
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

- [ ] Add play/pause controls
- [ ] Implement video scrubbing
- [ ] Support for local file uploads
- [ ] Animation synchronization controls
- [ ] Save/export composed videos
- [ ] Multiple animation layers
- [ ] Custom animation timing controls

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

