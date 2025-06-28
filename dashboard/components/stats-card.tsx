import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  trend: string
  icon: LucideIcon
  color: string
}

export function StatsCard({ title, value, trend, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)] hover:border-[rgba(14,165,233,0.2)] transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[rgba(250,250,250,0.7)]">{title}</p>
            <p className="text-2xl font-bold text-[#FAFAFA]">{value}</p>
            <p className="text-xs text-[rgba(250,250,250,0.7)] mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-lg bg-[rgba(14,165,233,0.1)] ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
