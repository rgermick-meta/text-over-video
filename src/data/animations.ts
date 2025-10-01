import { RiveAnimation, VideoClip } from '../types';

export const SAMPLE_ANIMATIONS: RiveAnimation[] = [
  {
    id: 'confetti',
    name: 'Confetti',
    src: 'https://public.rive.app/community/runtime-files/2063-4080-confetti-explosion.riv',
    thumbnail: 'https://public.rive.app/community/thumbnails/2063-4080-confetti-explosion.png',
    stateMachine: 'State Machine 1',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    src: 'https://public.rive.app/community/runtime-files/7244-14214-heart-like.riv',
    thumbnail: 'https://public.rive.app/community/thumbnails/7244-14214-heart-like.png',
    stateMachine: 'State Machine 1',
  },
  {
    id: 'stars',
    name: 'Stars',
    src: 'https://public.rive.app/community/runtime-files/2535-5117-rating-animation.riv',
    thumbnail: 'https://public.rive.app/community/thumbnails/2535-5117-rating-animation.png',
    stateMachine: 'State Machine 1',
  },
];

export const SAMPLE_VIDEOS: VideoClip[] = [
  {
    id: 'alien',
    name: 'Alien',
    src: '/videos/Alien.mp4',
    thumbnail: '/videos/thumbnails/Alien.jpg',
    description: 'Alien themed video',
  },
  {
    id: 'feeling-myself',
    name: 'Feeling Myself',
    src: '/videos/Feeling myself.mp4',
    thumbnail: '/videos/thumbnails/Feeling myself.jpg',
    description: 'Confidence vibes',
  },
  {
    id: 'giant-phone',
    name: 'Giant Phone',
    src: '/videos/Giant Phone.mp4',
    thumbnail: '/videos/thumbnails/Giant Phone.jpg',
    description: 'Giant phone concept',
  },
  {
    id: 'hippo-kitten',
    name: 'Hippo and Kitten',
    src: '/videos/Hippo and kitten.mp4',
    thumbnail: '/videos/thumbnails/Hippo and kitten.jpg',
    description: 'Adorable animals',
  },
  {
    id: 'you-better-work',
    name: 'You Better Work',
    src: '/videos/You Better Work.mp4',
    thumbnail: '/videos/thumbnails/You Better Work.jpg',
    description: 'Work it!',
  },
  {
    id: 'beautiful',
    name: 'Beautiful',
    src: '/videos/beautiful.mp4',
    thumbnail: '/videos/thumbnails/beautiful.jpg',
    description: 'Beautiful scene',
  },
  {
    id: 'elephant-lowrider',
    name: 'Elephant Lowrider',
    src: '/videos/elephant_lowrider.mp4',
    thumbnail: '/videos/thumbnails/elephant_lowrider.jpg',
    description: 'Elephant lowrider style',
  },
  {
    id: 'medieval-knight',
    name: 'Medieval Knight',
    src: '/videos/medieval_knight.mp4',
    thumbnail: '/videos/thumbnails/medieval_knight.jpg',
    description: 'Medieval themed',
  },
  {
    id: 'singing-in-rain',
    name: 'Singing in the Rain',
    src: '/videos/singing_in_the_rain.mp4',
    thumbnail: '/videos/thumbnails/singing_in_the_rain.jpg',
    description: 'Classic musical vibes',
  },
  {
    id: 'sportsman',
    name: 'Sportsman',
    src: '/videos/sportsman.mp4',
    thumbnail: '/videos/thumbnails/sportsman.jpg',
    description: 'Athletic action',
  },
];

export const SAMPLE_VIDEO_URL = SAMPLE_VIDEOS[0].src;

