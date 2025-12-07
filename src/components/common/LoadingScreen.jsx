const LoadingScreen = ({ label = 'Loading experience...' }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-bg-base">
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border px-6 py-8 shadow-subtle">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  </div>
)

export default LoadingScreen
