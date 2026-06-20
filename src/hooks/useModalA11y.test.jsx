import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useModalA11y } from './useModalA11y';

function Harness({ onClose }) {
  const ref = useRef(null);
  useModalA11y(ref, true, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>
      <button>one</button>
      <button>two</button>
    </div>
  );
}

describe('useModalA11y', () => {
  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open', () => {
    render(<Harness onClose={() => {}} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'one' }));
  });
});
