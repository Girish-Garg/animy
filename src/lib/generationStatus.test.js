import { describe, it, expect } from 'vitest';
import { findActiveGeneratingPrompt } from './generationStatus';

describe('findActiveGeneratingPrompt', () => {
  it('returns null for missing or empty chat data', () => {
    expect(findActiveGeneratingPrompt(null)).toBeNull();
    expect(findActiveGeneratingPrompt({})).toBeNull();
    expect(findActiveGeneratingPrompt({ prompts: [] })).toBeNull();
  });

  it('returns null when no prompt is processing (e.g. after cancel)', () => {
    const chat = { prompts: [{ _id: '1', status: 'cancelled' }] };
    expect(findActiveGeneratingPrompt(chat)).toBeNull();
  });

  it('returns null when the prompt completed and has a video', () => {
    const chat = { prompts: [{ _id: '1', status: 'completed', video: { videoPath: 'x' } }] };
    expect(findActiveGeneratingPrompt(chat)).toBeNull();
  });

  it('returns the processing prompt when one is still generating', () => {
    const processing = { _id: '2', status: 'processing' };
    const chat = { prompts: [{ _id: '1', status: 'completed', video: {} }, processing] };
    expect(findActiveGeneratingPrompt(chat)).toBe(processing);
  });

  it('ignores a processing prompt that already has a video', () => {
    const chat = { prompts: [{ _id: '1', status: 'processing', video: { videoPath: 'x' } }] };
    expect(findActiveGeneratingPrompt(chat)).toBeNull();
  });
});
