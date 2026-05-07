import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const StatCard = ({ title, value, hint, icon: Icon, accent = "from-cyan-500/20 to-blue-500/10" }) => (
  <motion.div whileHover={{ y: -4 }}>
    <Card className={`overflow-hidden bg-gradient-to-br ${accent}`}>
      <CardContent className="relative p-6">
        <div className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-white/10 p-3">
          <Icon className="h-5 w-5 text-cyan-200" />
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="headline text-4xl font-semibold">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export default StatCard

