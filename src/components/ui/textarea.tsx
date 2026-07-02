import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3',
          'text-sm text-[var(--fg)] placeholder:text-[var(--fg-secondary)]',
          'transition-all duration-200 ease-out resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
