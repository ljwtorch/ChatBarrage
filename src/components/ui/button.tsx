import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98] hover:-translate-y-0.5',
          {
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm': variant === 'primary',
            'bg-[var(--muted)] text-[var(--fg)] hover:bg-[var(--border-color)]': variant === 'secondary',
            'hover:bg-[var(--muted)] text-[var(--fg-secondary)]': variant === 'ghost',
            'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 shadow-sm': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm rounded-[var(--radius-sm)]': size === 'sm',
            'h-10 px-5 text-sm rounded-[var(--radius-md)]': size === 'md',
            'h-12 px-6 text-base rounded-[var(--radius-md)]': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
