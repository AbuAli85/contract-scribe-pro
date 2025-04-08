
import { Button } from "@/components/ui/button"

interface ContractFilterProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

export function ContractFilter({ currentFilter, onFilterChange }: ContractFilterProps) {
  const filters = [
    { id: "all", label: "All Contracts" },
    { id: "active", label: "Active" },
    { id: "expired", label: "Expired" },
    { id: "cancelled", label: "Cancelled" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={currentFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
