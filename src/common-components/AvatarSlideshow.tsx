import React, { useState, useEffect, useRef } from 'react';
import './AvatarSlideshow.css';

interface AvatarSlideshowProps {
  images: string[];
  alt: string;
  className?: string;
}

// Configuration: Change this value to adjust slideshow timing (in milliseconds)
const SLIDESHOW_INTERVAL = 5000; // 5 seconds

const AvatarSlideshow: React.FC<AvatarSlideshowProps> = ({ images, alt, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 150); // Half of the CSS transition duration
    }, SLIDESHOW_INTERVAL);

    return () => clearInterval(interval);
  }, [isVisible, images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <img
      ref={imgRef}
      src={images[currentIndex]}
      alt={alt}
      className={`${className} ${isTransitioning ? 'avatar-slideshow-fade' : ''}`}
    />
  );
};

export default AvatarSlideshow;