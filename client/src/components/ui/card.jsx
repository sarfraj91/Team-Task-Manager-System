import { cn } from "@/lib/utils"

const Card = ({ className, children, ...props }) => (
  <div className={cn("glass-panel overflow-hidden", className)} {...props}>
    {children}
  </div>
)

const CardHeader = ({ className, children }) => <div className={cn("space-y-2 p-5 md:p-6", className)}>{children}</div>

const CardTitle = ({ className, children }) => (
  <h3 className={cn("headline text-lg font-semibold text-foreground", className)}>{children}</h3>
)

const CardDescription = ({ className, children }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
)

const CardContent = ({ className, children }) => <div className={cn("px-5 pb-5 md:px-6 md:pb-6", className)}>{children}</div>

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
