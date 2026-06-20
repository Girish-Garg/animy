import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

function mockMatchMedia(matches) {
  let listener;
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: (_event, cb) => {
      listener = cb;
    },
    removeEventListener: () => {},
  });
  return { fire: (m) => listener?.({ matches: m }) };
}

describe('useIsMobile', () => {
  it('returns true when the viewport matches the mobile query', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when it does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates when the media query changes', () => {
    const mm = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => mm.fire(true));
    expect(result.current).toBe(true);
  });
});
