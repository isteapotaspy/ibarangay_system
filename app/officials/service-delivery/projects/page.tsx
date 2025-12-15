"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"

import PropertyCard from "@/components/property-card"
import PropertyForm from "@/components/property-form"
import BorrowModal from "@/components/borrow-modal"

import { PropertyDisc } from "@/amplify/backend/functions/propertyApi/src/Property"

import {
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  borrowProperty,
  returnProperty,
} from "@/lib/backend/propertyApi"

const categories = [
  "Audio Equipment",
  "Furniture",
  "Electronics",
  "Event Equipment",
  "Sports Equipment",
  "Medical Equipment",
  "Power Equipment",
]

const conditions = ["Good", "Fair", "Needs Repair", "Broken"]

/* =====================================================
   SEARCH POPOVER
   ===================================================== */

export function PropertySearchPopover({
  data,
  onSearch,
}: {
  data: PropertyDisc[]
  onSearch: (filtered: PropertyDisc[]) => void
}) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [conditionFilter, setConditionFilter] = useState<string | "all">("all")

  const runSearch = () => {
    const terms = query.toLowerCase().split(" ").filter(Boolean)

    const filtered = data.filter((p) => {
      const textMatch = terms.every((term) =>
        Object.values(p).some((val) =>
          String(val).toLowerCase().includes(term)
        )
      )

      const categoryMatch = categoryFilter === "all" ? true : p.category === categoryFilter
      const conditionMatch = conditionFilter === "all" ? true : p.condition === conditionFilter

      return textMatch && categoryMatch && conditionMatch
    })

    onSearch(filtered)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4 space-y-4">
        <h3 className="font-semibold text-lg">Advanced Search</h3>

        <Input
          placeholder="Search keywords…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div>
          <p className="text-sm font-medium mb-1">All Categories:</p>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">All Conditions:</p>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={runSearch}>
          Apply Search
        </Button>
      </PopoverContent>
    </Popover>
  )
}

/* =====================================================
   ENTRY DRAWER
   ===================================================== */

function EntryDrawer({
  open,
  onOpenChange,
  property,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  property: Partial<PropertyDisc> | null
  onSave: (property: PropertyDisc) => void
  onDelete?: (id: string) => void
}) {
  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] max-w-none p-6 overflow-y-auto text-sm" style={{ width:'30vw', maxWidth:'30vw' }}>
        <PropertyForm
          property={property}
          onBack={() => onOpenChange(false)}
          onSave={onSave}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  )
}

/* =====================================================
   MAIN PAGE
   ===================================================== */

export default function PropertyPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<PropertyDisc[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyDisc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Partial<PropertyDisc> | null>(null)

  const [borrowModalOpen, setBorrowModalOpen] = useState(false)
  const [propertyToBorrow, setPropertyToBorrow] = useState<PropertyDisc | null>(null)

  const [toastMessage, setToastMessage] = useState<string | null>(null) // Toast notification

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      setError(null)
      const data = await listProperties()
      setProperties(data)
      setFilteredProperties(data)
    } catch (err) {
      console.error("Failed to load properties:", err)
      setError("Failed to load properties. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setFilteredProperties(properties)
  }, [properties])

  /* ====================
     ACTIONS
  ==================== */

  const handleBorrow = (property: PropertyDisc) => {
    setPropertyToBorrow(property)
    setBorrowModalOpen(true)
  }

  const handleBorrowSubmit = async (data: {
    borrowedBy: string
    quantity: number
    borrowDate: string
    returnDate: string
  }) => {
    if (!propertyToBorrow) return

    try {
      const updated = await borrowProperty(
        propertyToBorrow.propertyId,
        data.borrowedBy,
        data.quantity,
        data.borrowDate,
        data.returnDate
      )

      setProperties(prev =>
        prev.map(p => p.propertyId === updated.propertyId ? updated : p)
      )

      setBorrowModalOpen(false)
      setPropertyToBorrow(null)

      // Toast notification for borrow
      setToastMessage("Item borrowed successfully!")
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error("Failed to borrow property:", err)
      alert("Failed to borrow property. Please try again.")
    }
  }

  const handleReturn = async (propertyId: string, borrowId: string) => {
    try {
      const updated = await returnProperty(propertyId, borrowId)

      setProperties(prev =>
        prev.map(p => p.propertyId === updated.propertyId ? updated : p)
      )

      // Toast notification for return
      setToastMessage("Item returned successfully!")
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error("Failed to return property:", err)
      alert("Failed to return property. Please try again.")
    }
  }

  const handleView = (id: string) => {
    router.push(`/officials/service-delivery/projects/${id}`)
  }

  const handleEdit = (property: PropertyDisc) => {
    setSelectedProperty(property)
    setDrawerOpen(true)
  }

  const handleSave = async (saved: PropertyDisc) => {
    try {
      if (saved.propertyId) {
        await updateProperty(saved.propertyId, saved)
        setProperties(prev =>
          prev.map(p => p.propertyId === saved.propertyId ? saved : p)
        )
      } else {
        const newProperty = await createProperty(saved)
        setProperties(prev => [...prev, newProperty])
      }
      setDrawerOpen(false)
      setSelectedProperty(null)
    } catch (err) {
      console.error("Failed to save property:", err)
      alert("Failed to save property. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id)
      setProperties(prev => prev.filter(p => p.propertyId !== id))
      setDrawerOpen(false)
      setSelectedProperty(null)
    } catch (err) {
      console.error("Failed to delete property:", err)
      alert("Failed to delete property. Please try again.")
    }
  }

  /* ====================
     RENDER
  ==================== */

  if (loading) return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading properties...</p></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-600">{error}</p><Button onClick={loadProperties}>Retry</Button></div>

  return (
    <div className="space-y-6 p-4">
      {/* HEADER / TOOLBAR */}
      <div className="flex items-center justify-between px-6">
        <h1 className="text-2xl font-bold">Property & Inventory Management</h1>

        <div className="flex gap-2">
          <PropertySearchPopover data={properties} onSearch={setFilteredProperties} />
          <Button onClick={() => { setSelectedProperty(null); setDrawerOpen(true) }}> <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
      </div>

      {/* CARDS GRID */}
      {filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>No properties found.</p>
          <Button variant="link" onClick={() => { setSelectedProperty(null); setDrawerOpen(true) }}>Add your first property</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.propertyId}
              property={property}
              onBorrow={() => handleBorrow(property)}
              onView={() => handleView(property.propertyId)}
              onEdit={() => handleEdit(property)}
              onReturn={(borrowId) => handleReturn(property.propertyId, borrowId)}
            />
          ))}
        </div>
      )}

      {/* DRAWER */}
      <EntryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        property={selectedProperty}
        onSave={handleSave}
        onDelete={selectedProperty?.propertyId ? handleDelete : undefined}
      />

      {/* BORROW MODAL */}
      <BorrowModal
        property={propertyToBorrow}
        open={borrowModalOpen}
        onClose={() => { setBorrowModalOpen(false); setPropertyToBorrow(null) }}
        onSubmit={handleBorrowSubmit}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
