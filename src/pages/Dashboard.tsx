
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, Database } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { ContractCard } from "@/components/ContractCard"
import { ContractFilter } from "@/components/ContractFilter"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isSeeding, setIsSeeding] = useState(false)

  const { toast } = useToast()

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true)
      // Since we're using a mock database, we'll seed it directly
      const supabase = getSupabaseClient()
      
      // Sample contracts
      const sampleContracts = [
        {
          id: "c1",
          title: "Artist Performance Agreement",
          reference_number: "PA-2025-001",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          client_name: "Global Entertainment Ltd",
          description: "Performance agreement for summer festival series",
        },
        {
          id: "c2",
          title: "Venue Rental Contract",
          reference_number: "VR-2025-002",
          status: "expired",
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          client_name: "Dubai Convention Center",
          description: "Venue rental for corporate event",
        },
        {
          id: "c3",
          title: "Music Licensing Agreement",
          reference_number: "MLA-2025-003",
          status: "cancelled",
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          client_name: "Universal Records",
          description: "Licensing agreement for new album release",
        }
      ]
      
      // Sample signatories
      const sampleSignatories = [
        {
          id: "s1",
          contract_id: "c1",
          name: "Ahmed Al Mansour",
          role: "Artist",
          signed: true,
          signature_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "s2",
          contract_id: "c1",
          name: "Sarah Thompson",
          role: "Event Organizer",
          signed: true,
          signature_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "s3",
          contract_id: "c2",
          name: "Mohammed Al Fahim",
          role: "Venue Manager",
          signed: true,
          signature_date: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "s4",
          contract_id: "c2",
          name: "John Miller",
          role: "Event Coordinator",
          signed: true,
          signature_date: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "s5",
          contract_id: "c3",
          name: "Fatima Al Zaabi",
          role: "Artist Manager",
          signed: true,
          signature_date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "s6",
          contract_id: "c3",
          name: "Michael Jenkins",
          role: "Label Representative",
          signed: false,
          signature_date: null,
        }
      ]
      
      // Add to mock database (replace existing data)
      await supabase.from("contracts").delete().eq("id", "c1").execute();
      await supabase.from("contracts").delete().eq("id", "c2").execute();
      await supabase.from("contracts").delete().eq("id", "c3").execute();
      await supabase.from("signatories").delete().eq("contract_id", "c1").execute();
      await supabase.from("signatories").delete().eq("contract_id", "c2").execute();
      await supabase.from("signatories").delete().eq("contract_id", "c3").execute();
      
      await supabase.from("contracts").insert(sampleContracts).execute();
      await supabase.from("signatories").insert(sampleSignatories).execute();
      
      toast({
        title: "Database seeded successfully",
        description: "Sample contracts have been added to the database.",
      })
      
      // Refresh the contracts list
      fetchContracts()
    } catch (error) {
      console.error("Error seeding database:", error)
      toast({
        title: "Error seeding database",
        description: error instanceof Error ? error.message : "An error occurred while seeding the database.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const fetchContracts = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()

    try {
      // Get all contracts
      const { data: contractsData, error } = await supabase
        .from("contracts")
        .select("*")
        .execute();
      
      if (error) {
        console.error("Error fetching contracts:", error)
        setContracts([])
        setLoading(false)
        return
      }

      // Get all signatories
      const { data: signatoriesData, error: signatoriesError } = await supabase
        .from("signatories")
        .select("*")
        .execute();
      
      if (signatoriesError) {
        console.error("Error fetching signatories:", signatoriesError)
      }

      // Combine contracts with their signatories
      const contractsWithSignatories = contractsData.map((contract) => {
        const contractSignatories =
          signatoriesData?.filter((signatory) => signatory.contract_id === contract.id) || []

        return {
          ...contract,
          signatories: contractSignatories,
        }
      })

      // Apply filter if not "all"
      let filteredContracts = contractsWithSignatories
      if (filter !== "all") {
        filteredContracts = contractsWithSignatories.filter((c) => c.status === filter)
      }

      // Sort by created_at
      filteredContracts.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setContracts(filteredContracts)
    } catch (err) {
      console.error("Error in fetchContracts:", err)
      setContracts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [filter])

  // Calculate statistics
  const totalContracts = contracts.length
  const activeContracts = contracts.filter((c) => c.status === "active").length
  const expiredContracts = contracts.filter((c) => c.status === "expired").length
  const cancelledContracts = contracts.filter((c) => c.status === "cancelled").length

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleSeedDatabase}
            variant="outline"
            className="flex items-center gap-1"
            disabled={isSeeding}
          >
            <Database className="h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed Database"}
          </Button>
          <Link to="/create-contract">
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Create New Contract
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{totalContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeContracts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredContracts}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{cancelledContracts}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <ContractFilter currentFilter={filter} onFilterChange={setFilter} />

      {/* Contracts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : contracts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground mb-4">No contracts found</p>
                <Link to="/create-contract">
                  <Button>Create Your First Contract</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          contracts.map((contract) => <ContractCard key={contract.id} contract={contract} />)
        )}
      </div>
    </div>
  )
}
