import React from 'react';
import { RiveAnimation } from '../types';

interface StylePickerProps {
  animations: RiveAnimation[];
  selectedAnimation: RiveAnimation;
  onSelectAnimation: (animation: RiveAnimation) => void;
}

export const StylePicker: React.FC<StylePickerProps> = ({
  animations,
  selectedAnimation,
  onSelectAnimation,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h4 className="text-white font-bold mb-6 text-xl">
        Choose Animation Style
      </h4>
      <div className="flex flex-col gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
        {animations.map((animation) => (
          <button
            key={animation.id}
            onClick={() => onSelectAnimation(animation)}
            className={`w-full transition-all duration-200 rounded-lg overflow-hidden ${
              selectedAnimation.id === animation.id
                ? 'ring-4 ring-pink-500'
                : 'ring-2 ring-gray-600 hover:ring-gray-400'
            }`}
          >
            <div className="w-full aspect-[9/16] bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center overflow-hidden relative">
              {animation.thumbnail ? (
                <img
                  src={animation.thumbnail}
                  alt={animation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-center p-2">
                  <div className="text-2xl mb-1">✨</div>
                  <div className="text-xs font-medium">{animation.name}</div>
                </div>
              )}
              {selectedAnimation.id === animation.id && (
                <div className="absolute inset-0 bg-pink-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-pink-500 rounded-full p-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-900 px-4 py-3">
              <p className="text-white text-sm font-medium">{animation.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

