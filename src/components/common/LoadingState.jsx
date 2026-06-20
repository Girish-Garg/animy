export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-[#0075FF]" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
