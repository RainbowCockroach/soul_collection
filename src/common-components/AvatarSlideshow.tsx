import React, { useState, useEffect } from 'react';
import './AvatarSlideshow.css';

interface AvatarSlideshowProps {
  images: string[];
  alt: string;
  className?: string;
}

// Configuration: Base interval and randomization range (in milliseconds)
const BASE_SLIDESHOW_INTERVAL = 4000; // 4 seconds base
const RANDOM_RANGE = 3000; // +/- 3 seconds (total range: 1-7 seconds)

// Helper function to get random interval
const getRandomInterval = () => {
  return BASE_SLIDESHOW_INTERVAL + (Math.random() * RANDOM_RANGE * 2) - RANDOM_RANGE;
};

const AvatarSlideshow: React.FC<AvatarSlideshowProps> = ({ images, alt, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    let timeoutId: number;

    const scheduleNextTransition = () => {
      const randomInterval = getRandomInterval();

      timeoutId = window.setTimeout(() => {
        setIsTransitioning(true);

        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
          setIsTransitioning(false);
          scheduleNextTransition(); // Schedule the next random transition
        }, 400); // Half of the CSS transition duration (0.8s)
      }, randomInterval);
    };

    scheduleNextTransition();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <img
      src={images[currentIndex]}
      alt={alt}
      className={`${className} ${isTransitioning ? 'avatar-slideshow-fade' : ''}`}
    />
  );
};

export default AvatarSlideshow;