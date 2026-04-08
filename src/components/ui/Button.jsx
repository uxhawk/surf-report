const variants = {
  primary:
    'bg-neon-pink text-white border border-neon-pink hover:shadow-neon-pink active:opacity-80',
  secondary:
    'bg-transparent text-neon-cyan border border-neon-cyan hover:shadow-neon-cyan active:opacity-80',
  danger:
    'bg-transparent text-neon-pink border border-neon-pink hover:bg-neon-pink hover:text-white active:opacity-80',
  ghost:
    'bg-transparent text-retro-muted border border-retro-border hover:border-retro-muted active:opacity-80',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-body font-medium rounded-lg
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
