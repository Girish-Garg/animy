import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Confirms the whole chain works: Vitest runs, jsdom provides the DOM,
// RTL renders, and @testing-library/jest-dom matchers are registered.
describe('test harness', () => {
  it('renders a component and supports jest-dom matchers', () => {
    render(<button>click me</button>);
    expect(screen.getByRole('button', { name: 'click me' })).toBeInTheDocument();
  });
});
