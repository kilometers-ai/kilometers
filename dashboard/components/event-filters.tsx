"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EventFilters as EventFiltersType } from "@/types/dashboard"

interface EventFiltersProps {
  filters: EventFiltersType
  onFiltersChange: (filters: EventFiltersType) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const updateFilter = (key: keyof EventFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Direction Filter */}
      <div>
        <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">Direction</label>
        <Select value={filters.direction} onValueChange={(value) => updateFilter("direction", value)}>
          <SelectTrigger className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <SelectItem value="all" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              All
            </SelectItem>
            <SelectItem value="request" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Request
            </SelectItem>
            <SelectItem value="response" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Response
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Method Search */}
      <div>
        <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">Method</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgba(250,250,250,0.5)]" />
          <Input
            placeholder="Search methods..."
            value={filters.method}
            onChange={(e) => updateFilter("method", e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA] placeholder:text-[rgba(250,250,250,0.5)]"
          />
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">Time Range</label>
        <Select value={filters.timeRange} onValueChange={(value) => updateFilter("timeRange", value)}>
          <SelectTrigger className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <SelectItem value="1h" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Last Hour
            </SelectItem>
            <SelectItem value="24h" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Last 24 Hours
            </SelectItem>
            <SelectItem value="7d" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Last 7 Days
            </SelectItem>
            <SelectItem value="30d" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Last 30 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risk Level */}
      <div>
        <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">Risk Level</label>
        <Select value={filters.riskLevel} onValueChange={(value) => updateFilter("riskLevel", value)}>
          <SelectTrigger className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <SelectItem value="all" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              All Levels
            </SelectItem>
            <SelectItem value="low" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Low (0-19)
            </SelectItem>
            <SelectItem value="medium" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              Medium (20-49)
            </SelectItem>
            <SelectItem value="high" className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]">
              High (50+)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
