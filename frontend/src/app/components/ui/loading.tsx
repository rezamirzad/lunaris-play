export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-900/20 border-t-blue-600" />
      <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
        Initializing Engine...
      </p>
    </div>
  );
}
