import React, { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc: string | null;
  fallbackColor?: string;
  className?: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
}

export function VideoBackground({
  videoSrc,
  fallbackColor = '#1a1a2e',
  className = '',
  children,
  overlayOpacity = 0.5,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!videoSrc) {
      video.src = '';
      setIsLoaded(false);
      return;
    }

    video.src = videoSrc;
    video.load();
    setIsLoaded(false);

    const onCanPlay = () => setIsLoaded(true);
    const onError = () => setIsLoaded(false);

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    video.play().catch(() => {
      // Autoplay might be blocked - that's ok
    });

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
    };
  }, [videoSrc]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Video Layer - only show when src is set and loaded */}
      {videoSrc && (
        <>
          <video
            key={videoSrc}
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            role="presentation"
          />
          {/* Fallback while loading */}
          {!isLoaded && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: fallbackColor }}
            />
          )}
        </>
      )}

      {/* Fallback color when no video */}
      {!videoSrc && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: fallbackColor }}
        />
      )}

      {/* Dark overlay for text readability - always present when video exists */}
      {videoSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.8}) 0%, rgba(0,0,0,${overlayOpacity}) 100%)`,
          }}
        />
      )}

      {/* Content layer */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}