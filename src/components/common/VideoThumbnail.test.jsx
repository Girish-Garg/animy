import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoThumbnail from './VideoThumbnail';

describe('VideoThumbnail', () => {
  it('renders an img with the thumbnail by default', () => {
    render(<VideoThumbnail thumbnailPath="/t.png" videoPath="/v.mp4" alt="My video" />);
    const img = screen.getByAltText('My video');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/t.png');
  });

  it('falls back to a video element when the image fails to load', () => {
    render(<VideoThumbnail thumbnailPath="/bad.png" videoPath="/v.mp4" alt="My video" />);
    fireEvent.error(screen.getByAltText('My video'));
    const video = document.querySelector('video');
    expect(video).toBeTruthy();
    expect(video).toHaveAttribute('src', '/v.mp4');
  });
});
