"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Save, Trash2, Search } from "lucide-react"
import { PropertyDisc } from "@/amplify/backend/functions/propertyApi/src/Property"

export interface PropertyFormProps {
  property: Partial<PropertyDisc> | null
  onSave: (property: PropertyDisc) => void
  onBack?: () => void
  onDelete?: (id: string) => void
}

const CATEGORIES = [
  "Furniture",
  "Electronics",
  "Audio Equipment",
  "Event Equipment",
  "Sports Equipment",
  "Medical Equipment",
  "Power Equipment",
]

export default function PropertyForm({
  property,
  onSave,
  onBack,
  onDelete,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<Partial<PropertyDisc>>(
    property || {
      name: "",
      category: "",
      description: "",
      quantity: 1,
      availableQuantity: 1,
      condition: "Good",
      location: "",
      borrowRecords: [],
    }
  )

  const [categorySearch, setCategorySearch] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return CATEGORIES
    return CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(categorySearch.toLowerCase())
    )
  }, [categorySearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const saved: PropertyDisc = {
      propertyId: property?.propertyId || "",
      name: formData.name!,
      category: formData.category!,
      description: formData.description!,
      quantity: formData.quantity!,
      availableQuantity: formData.availableQuantity ?? formData.quantity!,
      condition: formData.condition!,
      location: formData.location!,
      dateAdded: property?.dateAdded || new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      borrowRecords: property?.borrowRecords || [],
    }

    onSave(saved)
  }

  const handleDelete = () => {
    if (property?.propertyId && onDelete) {
      if (confirm("Are you sure you want to delete this property?")) {
        onDelete(property.propertyId)
      }
    }
  }

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category })
    setCategorySearch("")
    setShowCategoryDropdown(false)
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg "
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {property?.propertyId ? "Edit Property" : "Add New Property"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the property information below
          </p>
        </div>

        {property?.propertyId && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
            title="Delete Property"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFORMATION */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Property Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
            </div>

            <div className="relative">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Category *</label>
              <div className="relative">
                <input
                  required
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value })
                    setCategorySearch(e.target.value)
                    setShowCategoryDropdown(true)
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Search or type category..."
                  className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-900" />
              </div>
              
              {/* Category Dropdown */}
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-900">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-900 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Quantity *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Number(e.target.value),
                    availableQuantity: Number(e.target.value), // Auto-update available
                  })
                }
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Condition *</label>
              <select
                required
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as PropertyDisc["condition"],
                  })
                }
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Broken">Broken</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOCATION & DESCRIPTION */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Location & Description</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Location *</label>
              <input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
                placeholder="e.g. Storage Room A"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* BORROW STATUS */}
        {property?.borrowRecords && property.borrowRecords.length > 0 && (
          <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <h3 className="text-lg mb-4 text-orange-800 dark:text-gray-300">Active Borrows</h3>
            <div className="space-y-3">
              {property.borrowRecords
                .filter((record) => record.status === "borrowed")
                .map((record) => (
                  <div
                    key={record.borrowId}
                    className="space-y-2 text-sm border-b pb-2 last:border-0"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-600  dark:text-gray-300">Borrowed by:</span>
                      <span className="font-medium">{record.borrowedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Quantity:</span>
                      <span>{record.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Borrow Date:</span>
                      <span>{new Date(record.borrowDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Expected Return:</span>
                      <span>{new Date(record.returnDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-5 h-5" />
            {property?.propertyId ? "Update Property" : "Add Property"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}