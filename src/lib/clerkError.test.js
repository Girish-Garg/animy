import { describe, it, expect } from 'vitest';
import { clerkErrorMessage } from './clerkError';

describe('clerkErrorMessage', () => {
  it('prefers longMessage', () => {
    expect(clerkErrorMessage({ errors: [{ longMessage: 'long', message: 'short' }] })).toBe('long');
  });

  it('falls back to message when longMessage is missing', () => {
    expect(clerkErrorMessage({ errors: [{ message: 'short' }] })).toBe('short');
  });

  it('uses the fallback when there are no errors', () => {
    expect(clerkErrorMessage({}, 'fb')).toBe('fb');
    expect(clerkErrorMessage(null, 'fb')).toBe('fb');
    expect(clerkErrorMessage({ errors: [] }, 'fb')).toBe('fb');
  });
});
