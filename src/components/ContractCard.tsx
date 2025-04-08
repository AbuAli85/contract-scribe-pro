
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Signatory {
  id: string
  contract_id: string
  name: string
  role: string
  signed: boolean
  signature_date: string | null
}

interface Contract {
  id: string
  title: string
  reference_number: string
  status: string
  created_at: string
  updated_at: string
  start_date: string
  end_date: string
  client_name: string
  description: string
  signatories?: Signatory[]
}

interface ContractCardProps {
  contract: Contract
}

export function ContractCard({ contract }: ContractCardProps) {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status badge based on contract status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <div className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Active</div>
      case "expired":
        return <div className="flex items-center text-amber-600"><Clock className="h-4 w-4 mr-1" /> Expired</div>
      case "cancelled":
        return <div className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Cancelled</div>
      default:
        return <div className="flex items-center text-gray-600"><Clock className="h-4 w-4 mr-1" /> {status}</div>
    }
  }

  // Check if all signatories have signed
  const allSigned = contract.signatories?.every(s => s.signed) ?? false
  
  // Count signatories and how many have signed
  const signedCount = contract.signatories?.filter(s => s.signed).length ?? 0
  const totalSignatories = contract.signatories?.length ?? 0

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="font-semibold text-lg line-clamp-2">{contract.title}</h3>
          <p className="text-sm text-muted-foreground">Ref: {contract.reference_number}</p>
          <p className="text-sm text-muted-foreground mt-1">Client: {contract.client_name}</p>
        </div>
        
        <div className="text-sm mb-4 flex-1">
          <p className="line-clamp-2 text-muted-foreground">{contract.description}</p>
          <div className="mt-2">
            <p className="text-xs">
              <span className="text-muted-foreground">Valid: </span>
              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <div>{getStatusBadge(contract.status)}</div>
          
          <div className="text-xs text-muted-foreground">
            {signedCount}/{totalSignatories} signatures
          </div>
        </div>
        
        <div className="mt-4">
          <Link to={`/contracts/${contract.id}`}>
            <Button variant="outline" className="w-full">View Contract</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
