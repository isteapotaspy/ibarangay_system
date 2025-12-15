'use client'

import { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet'
import ResidentForm from '@/components/resident-form'
import ResidentProfile from "@/app/officials/residentinformation/profile/page"
import { Resident } from "@/amplify/backend/functions/residentsApi/src/Resident"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Search, Loader2, Plus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useResidents } from "@/hooks/use-Residents"
import { useTheme } from "@/context/ThemeContext";

/* =====================================================
SEARCH POPOVER
===================================================== */

export function ResidentSearchPopover({
  data,
  onSearch,
}: {
  data: Resident[];
  onSearch: (filtered: Resident[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [purokFilter, setPurokFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [vulFilter, setVulFilter] = useState<string | "all">("all");

  // Extract unique puroks, statuses, and vulnerable types
  const puroks = useMemo(() => Array.from(new Set(data.map(r => r.purok))).sort(), [data]);
  const statuses = useMemo(() => Array.from(new Set(data.map(r => r.status))).sort(), [data]);
  const vulnerableTypes = useMemo(() => {
    const types = data.flatMap(r => r.vulnerableTypes || []);
    return Array.from(new Set(types)).sort();
  }, [data]);

  const runSearch = () => {
    const terms = query.toLowerCase().split(" ").filter(Boolean);
    const filtered = data.filter(r => {
      const textMatch = terms.every(term =>
        Object.values(r).some(val => String(val).toLowerCase().includes(term))
      );
      
      const purokMatch = purokFilter === "all" ? true : r.purok === purokFilter;
      const statusMatch = statusFilter === "all" ? true : r.status === statusFilter;
      const vulMatch = vulFilter === "all"
        ? true
        : (r.vulnerableTypes || []).includes(vulFilter);

      return textMatch && purokMatch && statusMatch && vulMatch;
    });

    onSearch(filtered);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 space-y-4">
        
        <Input
          placeholder="Search keywords…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {/* Purok Filter */}
        <div>
          <p className="text-sm font-medium mb-1">Purok:</p>
          <Select value={purokFilter} onValueChange={setPurokFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Purok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Puroks</SelectItem>
              {puroks.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
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

        {/* Vulnerable Type Filter */}
        <div>
          <p className="text-sm font-medium mb-1">Vulnerable Type:</p>
          <Select value={vulFilter} onValueChange={setVulFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {vulnerableTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={runSearch}>Apply Search</Button>
      </PopoverContent>
    </Popover>
  );
}

export default function ResidentsPage() {
  // Use the backend hook
  const { residents, loading, add, update, remove, refresh } = useResidents();

  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [filteredData, setFilteredData] = useState<Resident[]>([])
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const { theme } = useTheme();

  // Update filtered data when residents change
  useEffect(() => {
    setFilteredData(residents);
  }, [residents]);

  // Table columns
  const tableColumns: Record<string, string> = {
    residentId: 'ID',
    fullName: 'Name',
    address: 'Address',
    contactNumber: 'Contact No.',
    vulnerableTypes: 'Vulnerable Type',
    status: 'Status',
  }

  // Prepare table data
  const tableData = filteredData.map((r) => ({
    ...r,
    fullName: `${r.firstName} ${r.lastName}`,
    address: `${r.houseNumber} ${r.street}, ${r.city}`,
  }));

  // Save resident (from form) - now returns Promise<void>
  const handleSave = async (resident: Resident): Promise<void> => {
    try {
      if (resident.residentId && residents.some(r => r.residentId === resident.residentId)) {
        const {
          residentId,
          createdAt,
          updatedAt,
          ...updatableFields
        } : any = resident;

        await update(residentId, updatableFields);
      } else {
        const { residentId, ...residentData } = resident;
        await add(residentData);
      }

      setEditSheetOpen(false);
      setProfileSheetOpen(false);
      setSelectedResident(null);
    } catch (error) {
      console.error("Error saving resident:", error);
      throw error;
    }
  };

  // Delete resident
  const handleDelete = async (residentId: string) => {
    if (confirm("Are you sure you want to delete this resident?")) {
      try {
        await remove(residentId);
        setProfileSheetOpen(false);
        setSelectedResident(null);
      } catch (error) {
        console.error("Error deleting resident:", error);
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      
      {/* HEADER / TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold flex-shrink-0">Resident Management</h1>

        <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
          {/* Search / Filter Popover */}
          <ResidentSearchPopover
            data={residents}
            onSearch={setFilteredData}
          />

          {/* Refresh Button */}
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>

          {/* New Resident Button */}
          <Button
            onClick={() => {
              setSelectedResident(null);
              setEditSheetOpen(true);
            }}
          > <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
      </div>

      {/* TABLE */}
        <div className={`
          rounded-xl border overflow-hidden shadow-md
            ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
          `}>
        <table className="w-full min-w-full text-sm">
        <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              {Object.values(tableColumns).map((header) => (
                <th
                  key={header}
                  className={`text-left font-medium px-4 py-3 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td
                colSpan={Object.keys(tableColumns).length}
                className="text-center py-6 text-gray-400"
              >
                No records found
              </td>
            </tr>
          ) : (
            tableData.map((row) => (
              <tr
                key={row.residentId}
                className={`border-t cursor-pointer transition-colors
                  ${theme === "dark"
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-50 text-gray-700"}
                `}
                onClick={() => {
                  setSelectedResident(row)
                  setProfileSheetOpen(true)
                }}
              >
                {/* ID */}
                <td className="px-4 py-3">{row.residentId}</td>

                {/* Name + Family ID */}
                <td className="px-4 py-3">
                  <div>{row.fullName}</div>
                  {row.familyId && (
                    <div className="text-gray-400 text-xs">{row.familyId}</div>
                  )}
                </td>

                {/* Address + Purok */}
                <td className="px-4 py-3">
                  <div>{`${row.houseNumber} ${row.street}`}</div>
                  <div className="text-gray-400 text-xs">{row.purok}</div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3">{row.contactNumber}</td>

                {/* Vulnerable Types */}
                <td className="px-4 py-3">
                  {row.vulnerableTypes?.length ? (
                    row.vulnerableTypes.map((type: string) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 mr-1"
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">None</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      row.status === 'Active'
                        ? theme === 'dark'
                          ? 'bg-green-700 text-green-100'
                          : 'bg-green-100 text-green-700'
                        : row.status === 'Inactive'
                        ? theme === 'dark'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gray-100 text-gray-700'
                        : row.status === 'Transferred Out'
                        ? theme === 'dark'
                          ? 'bg-yellow-700 text-yellow-100'
                          : 'bg-yellow-100 text-yellow-700'
                        : theme === 'dark'
                        ? 'bg-red-700 text-red-100'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>

        </table>
      </div>

      {/* Profile Sheet */}
      <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen} >
        <SheetContent
          side="right"
          className="h-full p-6 overflow-y-auto text-sm shadow-xl"
          style={{ width: '50vw', maxWidth: '50vw' }} 
        >
          {selectedResident && (
            <ResidentProfile
              resident={selectedResident}
              onBack={() => setProfileSheetOpen(false)}
              onEdit={() => {
                setProfileSheetOpen(false);
                setEditSheetOpen(true);
              }}
              onDelete={() => handleDelete(selectedResident.residentId)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit / New Resident Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-[50vw] max-w-none p-6 overflow-y-auto text-sm"
          style={{ width: '60vw', maxWidth: '60vw' }}
        >
          <ResidentForm
            resident={selectedResident ?? undefined}
            onBack={() => setEditSheetOpen(false)}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
