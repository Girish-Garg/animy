import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';

const authState = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => authState(),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/protected" element={<div>secret content</div>} />
        </Route>
        <Route path="/signin" element={<div>sign in page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => authState.mockReset());

  it('renders neither content nor redirect while Clerk is loading', () => {
    authState.mockReturnValue({ isLoaded: false, isSignedIn: false });
    renderProtected();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
    expect(screen.queryByText('sign in page')).not.toBeInTheDocument();
  });

  it('redirects to /signin when signed out', () => {
    authState.mockReturnValue({ isLoaded: true, isSignedIn: false });
    renderProtected();
    expect(screen.getByText('sign in page')).toBeInTheDocument();
  });

  it('renders the protected route when signed in', () => {
    authState.mockReturnValue({ isLoaded: true, isSignedIn: true });
    renderProtected();
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });
});
