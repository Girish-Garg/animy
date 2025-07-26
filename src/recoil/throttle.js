import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({
  key: 'animyThrottleState', // Key for localStorage
  storage: localStorage,
});
// Atom to track if throttling is active and remaining time (in seconds)
export const isThrottleAtom = atom({
  key: 'isThrottleAtom',
  default: {
    lastCreatedAt: null, // timestamp in ms
    throttleDuration: 60, // seconds (default throttle duration, can be set from backend)
  },
  effects_UNSTABLE: [persistAtom],
});

// Selector to compute throttle state based on lastCreatedAt and duration
export const throttleStatusSelector = selector({
  key: 'throttleStatusSelector',
  get: ({ get }) => {
    const { lastCreatedAt, throttleDuration } = get(isThrottleAtom);
    if (!lastCreatedAt) {
      return {
        isThrottled: false,
        throttleTimeRemaining: 0,
      };
    }
    const now = Date.now();
    const elapsed = Math.floor((now - lastCreatedAt) / 1000); // seconds
    const remaining = throttleDuration - elapsed;
    return {
      isThrottled: remaining > 0,
      throttleTimeRemaining: remaining > 0 ? remaining : 0,
    };
  },
});

// Atom to track if video generation is in progress (global)
export const isGeneratingAtom = atom({
  key: 'isGeneratingAtom',
  default: {
    isGenerating: false,
  },
  effects_UNSTABLE: [persistAtom],
});
