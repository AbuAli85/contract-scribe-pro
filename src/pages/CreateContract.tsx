
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateContract() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Contract</h1>
      </div>
      
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground mb-4">Contract creation form will be implemented here</p>
        <p className="text-sm text-muted-foreground">This is a placeholder for the contract creation form</p>
      </div>
    </div>
  )
}
