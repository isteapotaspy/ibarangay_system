'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import CertificateForm from "@/components/certificate-form"
import CertificatePreview from "@/app/officials/certificate/preview/page"
import { Certificate, mockCertificates as initialCertificates } from "@/app/officials/certificate/mockCertificates"
import { mockOfficials } from './mockOfficials' 
import { useTheme } from "@/context/ThemeContext"

// --- Search / Filter Popover ---
export function CertificateSearchPopover({ data, onSearch }: { data: Certificate[], onSearch: (filtered: Certificate[]) => void }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | "all">("all")
  const [statusFilter, setStatusFilter] = useState<string | "all">("all")

  const types = useMemo(() => Array.from(new Set(data.map(c => c.certificateType))).sort(), [data])
  const statuses = useMemo(() => Array.from(new Set(data.map(c => c.status))).sort(), [data])

  const runSearch = () => {
    const terms = query.toLowerCase().split(" ").filter(Boolean)
    const filtered = data.filter(c => {
      const textMatch = terms.every(term =>
        Object.values(c).some(val => String(val).toLowerCase().includes(term))
      )
      const typeMatch = typeFilter === "all" ? true : c.certificateType === typeFilter
      const statusMatch = statusFilter === "all" ? true : c.status === statusFilter
      return textMatch && typeMatch && statusMatch
    })
    onSearch(filtered)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 space-y-4">
        <Input placeholder="Search keywords…" value={query} onChange={e => setQuery(e.target.value)} />
        <div>
          <p className="text-sm font-medium mb-1">Certificate Type:</p>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Status:</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={runSearch}>Apply Search</Button>
      </PopoverContent>
    </Popover>
  )
}

// --- Main Certificate System ---
export default function CertificateSystem() {
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const { theme } = useTheme()

  const getActiveOfficials = () => {
    const captain = mockOfficials.find(o => o.position === "Barangay Captain" && o.status === "Active")
    const secretary = mockOfficials.find(o => o.position === "Barangay Secretary" && o.status === "Active")
    return { captain, secretary }
  }

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert =>
      cert.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [certificates, searchTerm])

  const handleSave = (certificate: Certificate) => {
    const { captain, secretary } = getActiveOfficials()
    setCertificates(prev => {
      if (certificate.id) {
        return prev.map(c => (c.id === certificate.id ? certificate : c))
      } else {
        const newCert: Certificate = {
          ...certificate,
          id: `CERT-${prev.length + 1}`,
          captainName: captain?.fullName,
          secretaryName: secretary?.fullName,
          captainSignature: captain?.signatureImage,
          secretarySignature: secretary?.signatureImage,
          useDigitalSignature: true
        }
        return [...prev, newCert]
      }
    })
    setEditSheetOpen(false)
    setSelectedCertificate(null)
  }

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setProfileSheetOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6">
        <h1 className="text-2xl font-bold">Certificate System</h1>
        <div className="flex gap-2">
          <CertificateSearchPopover
            data={certificates}
            onSearch={(results: Certificate[]) => setCertificates(results)}
          />
          <Button onClick={() => setEditSheetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className={`rounded-xl border overflow-hidden shadow-md ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <table className="w-full min-w-full text-sm">
          <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              {["ID","Resident","Type","Purpose","Date Requested","Status"].map(header => (
                <th key={header} className={`text-left font-medium px-4 py-3 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={6} className={theme === "dark" ? "px-4 py-8 text-center text-gray-400" : "px-4 py-8 text-center text-gray-500"}>No certificate requests found</td>
              </tr>
            ) : filteredCertificates.map(cert => (
              <tr
                key={cert.id}
                className={`border-t hover:bg-gray-50 cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : ""}`}
                onClick={() => handlePreview(cert)}
              >
                <td className={theme === "dark" ? "px-4 py-3 text-gray-100" : "px-4 py-3 text-gray-700"}>{cert.id}</td>
                <td className={theme === "dark" ? "px-4 py-3 text-gray-100" : "px-4 py-3 text-gray-700"}>
                  <div>{cert.residentName}</div>
                  <div className={theme === "dark" ? "text-gray-300 text-xs" : "text-gray-400 text-xs"}>{cert.residentId}</div>
                </td>
                <td className={theme === "dark" ? "px-4 py-3 text-gray-100" : "px-4 py-3 text-gray-700"}>{cert.certificateType}</td>
                <td className={theme === "dark" ? "px-4 py-3 text-gray-100" : "px-4 py-3 text-gray-700"}>{cert.purpose}</td>
                <td className={theme === "dark" ? "px-4 py-3 text-gray-100" : "px-4 py-3 text-gray-700"}>{cert.dateRequested}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cert.status === "Pending" ? (theme === "dark" ? "bg-orange-700 text-orange-100" : "bg-orange-100 text-orange-700") :
                    cert.status === "Approved" ? (theme === "dark" ? "bg-yellow-700 text-yellow-100" : "bg-yellow-100 text-yellow-700") :
                    cert.status === "Completed" ? (theme === "dark" ? "bg-green-700 text-green-100" : "bg-green-100 text-green-700") :
                    theme === "dark" ? "bg-red-700 text-red-100" : "bg-red-100 text-red-700"
                  }`}>{cert.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PREVIEW SHEET */}
        <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
          <SheetContent side="right" className={`h-full p-6 overflow-y-auto text-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-xl`} style={{ width: '50vw', maxWidth: '50vw' }}>
            {selectedCertificate && <CertificatePreview certificate={selectedCertificate} onBack={() => setProfileSheetOpen(false)} />}
          </SheetContent>
        </Sheet>

        {/* FORM SHEET */}
        <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
          <SheetContent side="right" className={`p-6 overflow-y-auto text-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"}`} style={{ width: '50vw', maxWidth: '50vw' }}>
            <CertificateForm
              certificate={selectedCertificate ?? null}
              onBack={() => setEditSheetOpen(false)}
              onSave={handleSave}
              activeOfficials={getActiveOfficials()}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
