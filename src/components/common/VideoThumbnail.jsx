import { useState } from 'react';

/**
 * Renders a thumbnail image; if it fails to load, falls back to the video
 * element itself (first frame) via React state — replacing the old imperative
 * document.createElement / replaceWith DOM hacks that leaked elements.
 */
export default function VideoThumbnail({ thumbnailPath, videoPath, alt = '', className = '' }) {
  const [errored, setErrored] = useState(false);

  if (errored && videoPath) {
    return (
      <video
        src={videoPath}
        className={className}
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={thumbnailPath}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
