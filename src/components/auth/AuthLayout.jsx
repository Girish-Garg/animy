import { Toaster } from 'sonner';

const MAX_WIDTH = { md: 'max-w-md', lg: 'max-w-lg' };

/**
 * Shared chrome for the auth screens: background image, dim overlay, a single
 * Toaster, and a centered responsive wrapper. Each page renders its own
 * <Card> as children.
 */
export default function AuthLayout({ maxWidth = 'md', children }) {
  return (
    <div className="overflow-hidden flex relative items-center justify-center min-h-screen px-4 py-8 sm:px-6">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <Toaster richColors position="top-center" expand={false} />
      <div className={`relative z-20 w-full ${MAX_WIDTH[maxWidth] || MAX_WIDTH.md}`}>
        {children}
      </div>
    </div>
  );
}
