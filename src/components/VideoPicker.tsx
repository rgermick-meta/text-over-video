import React from 'react';
import { VideoClip } from '../types';

interface VideoPickerProps {
  videos: VideoClip[];
  selectedVideo: VideoClip;
  onSelectVideo: (video: VideoClip) => void;
}

export const VideoPicker: React.FC<VideoPickerProps> = ({
  videos,
  selectedVideo,
  onSelectVideo,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h4 className="text-white font-bold text-xl">Video Clips</h4>
        <p className="text-gray-400 text-sm mt-1">Select a video clip</p>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 pl-1 pt-1 pb-2 space-y-2 custom-scrollbar">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
              selectedVideo.id === video.id
                ? 'bg-pink-500/20 ring-2 ring-pink-500 ring-offset-0'
                : 'bg-gray-700/50 hover:bg-gray-700'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-20 flex-shrink-0 bg-gray-900 rounded overflow-hidden">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={video.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="bg-pink-500/90 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm font-medium truncate">{video.name}</p>
              {video.description && (
                <p className="text-gray-400 text-xs truncate">{video.description}</p>
              )}
            </div>
            
            {/* Selected indicator */}
            {selectedVideo.id === video.id && (
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

