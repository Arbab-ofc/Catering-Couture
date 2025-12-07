import { twMerge } from 'tailwind-merge'

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
)

const PrimaryButton = ({
  children,
  variant = 'filled',
  loading = false,
  className = '',
  icon,
  ...props
}) => {
  const base =
    'relative inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 ease-soft-spring focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    filled:
      'bg-golden-gradient text-[#1f130a] shadow-card hover:scale-[1.02] hover:shadow-glow active:scale-[0.99]',
    outline:
      'border border-accent text-text-primary bg-transparent hover:bg-accent/10',
    ghost: 'text-text-primary hover:bg-accent/10',
  }

  return (
    <button
      className={twMerge(base, variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

export default PrimaryButton