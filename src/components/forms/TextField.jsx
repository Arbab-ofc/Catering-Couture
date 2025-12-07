const TextField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required,
  placeholder = ' ',
  icon,
  ...props
}) => {
  const filled = value !== undefined && value !== null && `${value}` !== ''
  const labelOffset = icon ? 'left-9' : 'left-3'

  return (
    <label className="group relative block">
      {icon && (
        <span className="absolute left-3 top-3 text-text-secondary">{icon}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={type === 'number' ? 0 : undefined}
        className={`peer h-12 w-full rounded-xl border border-border bg-bg-base px-3 pt-3 text-text-primary shadow-inner outline-none transition placeholder-transparent focus:border-accent focus:shadow-glow ${icon ? 'pl-9' : ''}`}
        {...props}
      />
      <span
        className={`pointer-events-none absolute ${labelOffset} top-3 text-sm text-text-secondary transition-all duration-200 ease-soft-spring peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-accent peer-[&:not(:placeholder-shown)]:-translate-y-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-text-secondary ${filled ? '-translate-y-2 text-xs text-text-secondary' : ''}`}
      >
        {label}
      </span>
    </label>
  )
}

export default TextField
