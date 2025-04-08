
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUploader } from "@/components/DocumentUploader"
import { generateUniqueId } from "@/lib/utils"

export default function CreateContract() {
  // Generate a temporary contract ID for document attachments
  const [contractId] = useState(() => `temp-${generateUniqueId()}`)

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
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Contract form will be implemented here</p>
            <p className="text-sm text-muted-foreground">This is a placeholder for the contract creation form</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploader contractId={contractId} />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button size="lg">
            Save Contract
          </Button>
        </div>
      </div>
    </div>
  )
}
