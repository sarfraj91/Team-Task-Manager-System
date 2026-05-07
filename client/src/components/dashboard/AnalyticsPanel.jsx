import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const pieColors = ["#22d3ee", "#38bdf8", "#fb7185", "#f59e0b", "#10b981"]

const AnalyticsPanel = ({ productivity = [], statusDistribution = [], priorityDistribution = [] }) => (
  <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
    <Card>
      <CardHeader>
        <CardTitle>Productivity pulse</CardTitle>
        <CardDescription>Seven-day completion trend across the workspace.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={productivity}>
            <defs>
              <linearGradient id="completedFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="activeFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" />
            <Tooltip
              cursor={{ stroke: "rgba(34, 211, 238, 0.2)" }}
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20
              }}
            />
            <Area type="monotone" dataKey="active" stroke="#818cf8" fill="url(#activeFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="completed" stroke="#22d3ee" fill="url(#completedFill)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status mix</CardTitle>
          <CardDescription>Board distribution by workflow stage.</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusDistribution} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={4}>
                {statusDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(2, 6, 23, 0.92)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority focus</CardTitle>
          <CardDescription>How attention is spread across urgency levels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {priorityDistribution.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(item.value * 12, item.value ? 16 : 0)}px`,
                    backgroundColor: pieColors[index % pieColors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
)

export default AnalyticsPanel
