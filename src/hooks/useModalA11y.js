import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Adds modal accessibility to an existing element — used by the overlays that
 * keep their own GSAP-animated shell instead of the portal-based <Modal>:
 * Escape to close, a Tab focus trap, and focus moved in on open / restored on
 * close. The target element should also have role="dialog" aria-modal="true"
 * tabIndex={-1}.
 *
 * onClose is kept in a ref so the effect only re-runs when `isOpen` changes,
 * not on every parent re-render (which would re-steal focus).
 */
export function useModalA11y(ref, isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const previouslyFocused = document.activeElement;
    const focusable = node.querySelectorAll(FOCUSABLE);
    (focusable[0] || node).focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key === 'Tab') {
        const items = node.querySelectorAll(FOCUSABLE);
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [isOpen, ref]);
}
