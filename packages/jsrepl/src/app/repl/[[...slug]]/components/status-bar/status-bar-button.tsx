import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function StatusBarButton({ children, className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="none"
      className={cn(
        'hover:bg-secondary hover:text-secondary-foreground h-[1.375rem] rounded-none px-2 text-xs font-normal leading-[1.375rem] focus-visible:ring-inset focus-visible:ring-offset-0',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
