type DesktopEditionLoadingProps = {
  error?: string;
  onRetry?: () => void;
};

export function DesktopEditionLoading({
  error,
  onRetry,
}: DesktopEditionLoadingProps) {
  return (
    <div
      className="flex min-h-screen items-center bg-wheat px-6 text-ink"
      data-desktop-edition-state={error ? "error" : "loading"}
    >
      <div className="w-full border-t-2 border-ink pt-5 font-mono text-sm font-bold uppercase tracking-[0.12em]">
        <p role={error ? "alert" : "status"} aria-live="polite">
          {error ? "The desktop edition could not be loaded." : "Loading desktop edition…"}
        </p>
        {error && onRetry ? (
          <button
            type="button"
            className="mt-5 min-h-11 border-2 border-ink px-5 py-3"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
