export function FormField({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-retro-muted text-sm font-medium">
        {label}
        {required && <span className="text-neon-pink ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-retro-muted text-xs">{hint}</p>}
      {error && <p className="text-neon-pink text-xs" role="alert">{error}</p>}
    </div>
  )
}
