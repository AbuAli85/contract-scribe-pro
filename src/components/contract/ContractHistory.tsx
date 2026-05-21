
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, ArrowRight, Clock, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import type { ContractData } from "@/types/contract"

interface ContractHistoryProps {
  language: "ar" | "en"
  onLoadContract: (contract: ContractData) => void
  onSaveContract?: (contract: ContractData) => void
  currentContract: ContractData
}

type StoredContract = {
  id: string
  timestamp: number
  contract: ContractData
  label: string
}

export default function ContractHistory({ 
  language, 
  onLoadContract, 
  onSaveContract, 
  currentContract 
}: ContractHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [storedContracts, setStoredContracts] = useState<StoredContract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<StoredContract[]>([])
  const [selectedContract, setSelectedContract] = useState<StoredContract | null>(null)
  const [customLabel, setCustomLabel] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // Load contracts from localStorage on component mount
  useEffect(() => {
    const savedContracts = localStorage.getItem("savedContracts")
    if (savedContracts) {
      try {
        const parsedContracts = JSON.parse(savedContracts) as StoredContract[]
        setStoredContracts(parsedContracts)
        setFilteredContracts(parsedContracts)
      } catch (error) {
        console.error("Error parsing saved contracts:", error)
      }
    }
  }, [])
  
  // Save contracts to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedContracts", JSON.stringify(storedContracts))
  }, [storedContracts])
  
  // Filter contracts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContracts(storedContracts)
      return
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase()
    const filtered = storedContracts.filter(item => {
      const referenceMatch = item.contract.referenceNumber?.toLowerCase().includes(lowerCaseQuery)
      const labelMatch = item.label.toLowerCase().includes(lowerCaseQuery)
      const firstPartyMatch = item.contract.firstParty?.nameEn?.toLowerCase().includes(lowerCaseQuery) ||
                             item.contract.firstParty?.nameAr?.includes(lowerCaseQuery)
      const secondPartyMatch = item.contract.secondParty?.nameEn?.toLowerCase().includes(lowerCaseQuery) ||
                              item.contract.secondParty?.nameAr?.includes(lowerCaseQuery)
      const promoterMatch = item.contract.promoter?.nameEn?.toLowerCase().includes(lowerCaseQuery) ||
                           item.contract.promoter?.nameAr?.includes(lowerCaseQuery)
      
      return referenceMatch || labelMatch || firstPartyMatch || secondPartyMatch || promoterMatch
    })
    
    setFilteredContracts(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [searchQuery, storedContracts])
  
  // Save current contract
  const handleSaveContract = () => {
    const newContract: StoredContract = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      contract: {...currentContract},
      label: customLabel || `${currentContract.firstParty?.nameEn || 'Contract'} - ${currentContract.secondParty?.nameEn || new Date().toLocaleDateString()}`,
    }
    
    setStoredContracts(prev => [newContract, ...prev])
    setCustomLabel("")
    
    if (onSaveContract) {
      onSaveContract(currentContract)
    }
  }
  
  // Load selected contract
  const handleLoadContract = (contract: StoredContract) => {
    onLoadContract(contract.contract)
  }
  
  // Delete contract from history
  const handleDeleteContract = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setStoredContracts(prev => prev.filter(contract => contract.id !== id))
    if (selectedContract?.id === id) {
      setSelectedContract(null)
    }
  }
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentContracts = filteredContracts.slice(startIndex, endIndex)
  
  return (
    <Card className={language === "ar" ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle>{language === "ar" ? "سجل العقود" : "Contract History"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save current contract section */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              {language === "ar" ? "حفظ العقد الحالي" : "Save Current Contract"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "ar" ? "حفظ العقد" : "Save Contract"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === "ar" 
                    ? "يمكنك إضافة تسمية مخصصة لهذا العقد لسهولة الرجوع إليه لاحقًا" 
                    : "You can add a custom label to this contract for easy reference later"}
                </p>
                <Input
                  placeholder={language === "ar" ? "تسمية (اختياري)" : "Label (Optional)"}
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <DialogClose asChild>
                  <Button variant="outline">
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleSaveContract}>
                    {language === "ar" ? "حفظ" : "Save"}
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "ar" ? "البحث في العقود..." : "Search contracts..."}
            className={`pl-8 ${language === "ar" ? "text-right" : "text-left"}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Contract list */}
        {filteredContracts.length > 0 ? (
          <div className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {currentContracts.map((contract) => (
                  <Card key={contract.id} className={`cursor-pointer transition-colors hover:bg-muted ${selectedContract?.id === contract.id ? 'border-primary' : ''}`} onClick={() => setSelectedContract(contract)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{contract.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {contract.contract.referenceNumber}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(contract.timestamp)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            handleLoadContract(contract);
                          }}>
                            {language === "ar" ? "تحميل" : "Load"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteContract(contract.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm">{currentPage} / {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد عقود محفوظة" : "No saved contracts"}
            </p>
          </div>
        )}
        
        {/* Contract Details */}
        {selectedContract && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-medium mb-2">{language === "ar" ? "تفاصيل العقد" : "Contract Details"}</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{language === "ar" ? "رقم المرجع:" : "Reference:"}</div>
                <div>{selectedContract.contract.referenceNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{language === "ar" ? "الطرف الأول:" : "First Party:"}</div>
                <div>{language === "ar" 
                  ? selectedContract.contract.firstParty?.nameAr 
                  : selectedContract.contract.firstParty?.nameEn}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{language === "ar" ? "الطرف الثاني:" : "Second Party:"}</div>
                <div>{language === "ar" 
                  ? selectedContract.contract.secondParty?.nameAr 
                  : selectedContract.contract.secondParty?.nameEn}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{language === "ar" ? "المروج:" : "Promoter:"}</div>
                <div>{language === "ar" 
                  ? selectedContract.contract.promoter?.nameAr 
                  : selectedContract.contract.promoter?.nameEn}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">{language === "ar" ? "تاريخ الإنشاء:" : "Created:"}</div>
                <div>{formatDate(selectedContract.timestamp)}</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive"
                onClick={() => handleDeleteContract(selectedContract.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === "ar" ? "حذف" : "Delete"}
              </Button>
              <Button size="sm" onClick={() => handleLoadContract(selectedContract)}>
                {language === "ar" ? "تحميل هذا العقد" : "Load This Contract"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
