
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DocumentUploader } from "@/components/DocumentUploader"
import { DocumentsPanel } from "@/components/DocumentsPanel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateUniqueId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CreateContract() {
  // Generate a temporary contract ID for document attachments
  const [contractId] = useState(() => `temp-${generateUniqueId()}`)
  const [documents, setDocuments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    type: "employment",
    description: "",
    startDate: "",
    endDate: "",
    value: "",
    currency: "usd",
    status: "draft"
  })
  const [useNewDocumentsPanel, setUseNewDocumentsPanel] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    // Validation would go here
    if (!formData.title || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Contract saved",
      description: "Your contract has been saved successfully.",
    })

    // In a real app, you would save the contract to the database here
    console.log("Contract data:", formData)
    console.log("Documents:", documents)
  }

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
        <div>
          <Button 
            variant="outline" 
            onClick={() => setUseNewDocumentsPanel(!useNewDocumentsPanel)}
            className="mr-2"
          >
            Toggle Documents Panel
          </Button>
          <Button onClick={handleSubmit}>
            Save Contract
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
            <CardDescription>Enter the basic information for this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter contract title" 
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract-type">Contract Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={handleSelectChange("type")}
                  >
                    <SelectTrigger id="contract-type">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="service">Service Agreement</SelectItem>
                      <SelectItem value="nda">Non-Disclosure</SelectItem>
                      <SelectItem value="rental">Rental/Lease</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Enter contract description" 
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    name="startDate" 
                    type="date" 
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    name="endDate" 
                    type="date" 
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Contract Value</Label>
                  <Input 
                    id="value" 
                    name="value" 
                    type="number" 
                    placeholder="Enter contract value" 
                    value={formData.value}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={handleSelectChange("currency")}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                      <SelectItem value="aed">AED</SelectItem>
                      <SelectItem value="sar">SAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {useNewDocumentsPanel ? (
          <DocumentsPanel 
            contractId={contractId} 
            documents={documents}
            onDocumentsChange={setDocuments}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploader contractId={contractId} />
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSubmit}>
            Save Contract
          </Button>
        </div>
      </div>
    </div>
  )
}
