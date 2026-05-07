import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const SearchInput = ({ className, ...props }) => (
  <div className={`relative ${className || ""}`}>
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className="pl-11" {...props} />
  </div>
)

export default SearchInput

