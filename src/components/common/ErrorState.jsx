export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <p className="text-sm text-gray-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-[#0075FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
