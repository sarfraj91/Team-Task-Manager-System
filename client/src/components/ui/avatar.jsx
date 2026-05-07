import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { getInitials } from "@/lib/utils"

const Avatar = ({ src, alt, fallback, className = "" }) => (
  <AvatarPrimitive.Root
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 ${className}`}
  >
    <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
    <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-sm font-semibold text-slate-100">
      {fallback || getInitials(alt)}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
)

export { Avatar }

