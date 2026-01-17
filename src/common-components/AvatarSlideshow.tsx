import React, { useState, useEffect, useRef } from 'react';
import './AvatarSlideshow.css';

interface AvatarSlideshowProps {
  images: string[];
  alt: string;
  className?: string;
}

// Configuration: Base interval and randomization range (in milliseconds)
const BASE_SLIDESHOW_INTERVAL = 15000; // 15 seconds base
const RANDOM_RANGE = 5000; // +/- 5 seconds (total range: 10-20 seconds)

// Helper function to get random interval
const getRandomInterval = () => {
  return BASE_SLIDESHOW_INTERVAL + (Math.random() * RANDOM_RANGE * 2) - RANDOM_RANGE;
};

// Helper function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

const AvatarSlideshow: React.FC<AvatarSlideshowProps> = ({ images, alt, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  // Use ref to track index without causing effect re-runs
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (images.length <= 1) return;

    let timeoutId: number;
    let flashTimeoutId: number;
    let isActive = true;

    const scheduleNextTransition = () => {
      const randomInterval = getRandomInterval();

      timeoutId = window.setTimeout(async () => {
        if (!isActive) return;

        const nextIndex = (currentIndexRef.current + 1) % images.length;
        const nextImageSrc = images[nextIndex];

        try {
          // Preload the next image
          await preloadImage(nextImageSrc);

          if (!isActive) return;

          // Update ref and state
          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
          setIsFlashing(true);

          // Remove flash class after animation completes (0.6s)
          flashTimeoutId = window.setTimeout(() => {
            if (isActive) {
              setIsFlashing(false);
            }
          }, 600);

          // Schedule the next transition
          scheduleNextTransition();
        } catch {
          // If image fails to load, skip to next and continue
          if (isActive) {
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            scheduleNextTransition();
          }
        }
      }, randomInterval);
    };

    scheduleNextTransition();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (flashTimeoutId) {
        clearTimeout(flashTimeoutId);
      }
    };
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="avatar-slideshow-container">
      <img
        src={images[currentIndex]}
        alt={alt}
        className={className}
      />
      <div className={`avatar-slideshow-overlay ${isFlashing ? 'flashing' : ''}`} />
    </div>
  );
};

export default AvatarSlideshow;