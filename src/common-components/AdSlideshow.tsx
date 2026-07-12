import React, { useState, useEffect, useMemo } from 'react';
import type { AdItem } from '../helpers/objects';
import './AdSlideshow.css';

interface AdSlideshowProps {
  ads: AdItem[];
  className?: string;
  interval?: number; // Optional custom interval in milliseconds
}

// Configuration: Base interval and randomization range (in milliseconds)
const BASE_SLIDESHOW_INTERVAL = 10000; // 10 seconds base
const RANDOM_RANGE = 3000; // +/- 3 seconds (total range: 7-13 seconds)

// Helper function to get random interval
const getRandomInterval = (customInterval?: number) => {
  if (customInterval) {
    return customInterval;
  }
  return BASE_SLIDESHOW_INTERVAL + (Math.random() * RANDOM_RANGE * 2) - RANDOM_RANGE;
};

// Pick a random index different from the current one (avoids immediate repeats).
const getRandomNextIndex = (length: number, currentIndex: number) => {
  if (length <= 1) return 0;
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  return (currentIndex + offset) % length;
};

const AdSlideshow: React.FC<AdSlideshowProps> = ({ ads, className, interval }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoized so the slideshow effect doesn't restart on every parent render.
  const validAds = useMemo(() => ads.filter((ad) => ad.imageUrl), [ads]);

  // Keep the index in range when the ad list shrinks.
  useEffect(() => {
    if (validAds.length > 0 && currentIndex >= validAds.length) {
      setCurrentIndex(0);
    }
  }, [validAds.length, currentIndex]);

  useEffect(() => {
    if (validAds.length <= 1) return;

    let scheduleTimeoutId: number;
    let fadeTimeoutId: number;

    const scheduleNextTransition = () => {
      const randomInterval = getRandomInterval(interval);

      scheduleTimeoutId = window.setTimeout(() => {
        setIsTransitioning(true);

        fadeTimeoutId = window.setTimeout(() => {
          setCurrentIndex((prevIndex) => getRandomNextIndex(validAds.length, prevIndex));
          setIsTransitioning(false);
          scheduleNextTransition(); // Schedule the next random transition
        }, 400); // Half of the CSS transition duration (0.8s)
      }, randomInterval);
    };

    scheduleNextTransition();

    return () => {
      clearTimeout(scheduleTimeoutId);
      clearTimeout(fadeTimeoutId);
    };
  }, [validAds.length, interval]);

  if (validAds.length === 0) {
    return null;
  }

  const currentAd = validAds[currentIndex] ?? validAds[0];

  const handleClick = () => {
    if (currentAd.redirectUrl) {
      window.location.href = currentAd.redirectUrl;
    }
  };

  return (
    <div
      className={`ad-slideshow-container ${className || ''} ${
        currentAd.redirectUrl ? 'ad-slideshow-clickable' : ''
      }`}
      onClick={handleClick}
      role={currentAd.redirectUrl ? 'button' : undefined}
      tabIndex={currentAd.redirectUrl ? 0 : undefined}
      onKeyDown={(e) => {
        if (currentAd.redirectUrl && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="ad-label">Ad</div>
      <img
        src={currentAd.imageUrl}
        alt="Advertisement"
        className={`ad-slideshow-image ${isTransitioning ? 'ad-slideshow-fade' : ''}`}
      />
    </div>
  );
};

export default AdSlideshow;
