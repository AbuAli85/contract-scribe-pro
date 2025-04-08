
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { DocumentUploader } from "@/components/DocumentUploader"
import { DocumentsPanel } from "@/components/DocumentsPanel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateUniqueId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import ContractPreview from "@/components/ContractPreview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreateContract() {
  // Generate a temporary contract ID for document attachments
  const [contractId] = useState(() => `temp-${generateUniqueId()}`)
  const [documents, setDocuments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "Promoter Assignment Contract",
    type: "employment",
    description: "Electronics promotion at Muscat Grand Mall",
    startDate: "",
    endDate: "",
    value: "",
    currency: "usd",
    status: "draft",
    firstName: "Farzan",
    lastName: "Riyaz Munde",
    idNumber: "126208869",
    location: "Muscat Grand Mall",
    product: "Electronics"
  })
  const [useNewDocumentsPanel, setUseNewDocumentsPanel] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [language, setLanguage] = useState<"en" | "ar">("en")
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
    
    // Switch to preview tab after saving
    setActiveTab("preview")
  }

  // Transform form data to contract data format expected by ContractPreview
  const getContractData = () => {
    return {
      id: contractId,
      refNumber: `PRO-${new Date().getFullYear()}-${generateUniqueId().substring(0, 6)}`,
      firstParty: {
        name: {
          en: "Falcon Eye Management and Business SPC",
          ar: "عين الصقر للإدارة و الأعمال ش.م.و"
        },
        crn: {
          en: "1410869",
          ar: "1410869"
        }
      },
      secondParty: {
        name: {
          en: formData.title || "Al Madar Trading LLC",
          ar: formData.title || "المدار للتجارة ش.م.م"
        },
        crn: {
          en: "1234567",
          ar: "1234567"
        }
      },
      promoter: {
        name: {
          en: `${formData.firstName} ${formData.lastName}`,
          ar: `${formData.firstName} ${formData.lastName}`
        },
        id: {
          en: formData.idNumber || "126208869",
          ar: formData.idNumber || "126208869"
        }
      },
      product: {
        en: formData.product || "Electronics",
        ar: formData.product || "الإلكترونيات"
      },
      location: {
        en: formData.location || "Muscat Grand Mall",
        ar: formData.location || "مسقط جراند مول"
      },
      startDate: {
        en: formData.startDate || "06/04/2025",
        ar: formData.startDate || "06/04/2025"
      },
      endDate: {
        en: formData.endDate || "06/07/2025",
        ar: formData.endDate || "06/06/2025"
      },
      // Add any additional fields needed by the contract
      letterhead: documents.find(d => d.type === "letterhead")?.file_url || null,
      promoterPhoto: documents.find(d => d.type === "id")?.file_url || null,
    }
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setUseNewDocumentsPanel(!useNewDocumentsPanel)}
            className="mr-2"
          >
            Toggle Documents Panel
          </Button>
          <Select 
            value={language} 
            onValueChange={(value: "en" | "ar") => setLanguage(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit}>
            Save Contract
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Edit Contract
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Preview Contract
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Enter the basic information for this promoter assignment contract</CardDescription>
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
                        <SelectItem value="promoter">Promoter Assignment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Promoter First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Enter promoter first name" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Promoter Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Enter promoter last name" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input 
                      id="idNumber" 
                      name="idNumber" 
                      placeholder="Enter promoter ID number" 
                      value={formData.idNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      placeholder="Enter promotion location" 
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Input 
                    id="product" 
                    name="product" 
                    placeholder="Enter product being promoted" 
                    value={formData.product}
                    onChange={handleInputChange}
                  />
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
                        <SelectItem value="omr">OMR</SelectItem>
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
                <CardDescription>Upload relevant documents for this contract</CardDescription>
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
        </TabsContent>
        
        <TabsContent value="preview" className="min-h-[600px]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Contract Preview</CardTitle>
              <CardDescription>Preview how your contract will look</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <div className="contract-container">
                <ContractPreview 
                  language={language} 
                  contractData={getContractData()}
                  signatures={[]}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("edit")}>
                Edit Contract
              </Button>
              <Button onClick={() => window.print()}>
                Print Contract
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
