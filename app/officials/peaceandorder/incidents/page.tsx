'use client'

import { useState, useEffect, useCallback, memo } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

import { Table as TableIcon, ListChecks, KanbanSquare, Search, CreditCard, Plus} from "lucide-react"

import DynamicTable from "@/components/dynamicViewers/dynamic-table"
import DynamicQueue from "@/components/dynamicViewers/dynamic-queue"
import DynamicKanban from "@/components/dynamicViewers/dynamic-kanban"
import DynamicCardList from "@/components/dynamicViewers/dynamic-cardlist"

import IncidentForm from "@/components/incident-form"
import { Incident } from "@/app/officials/peaceandorder/incidents/mockIncidents"
import { useIncidents } from "@/hooks/use-Incidents"

// ------------------------- SEARCH POPOVER -------------------------
const SearchPopover = memo(function SearchPopover({ 
  data, 
  onSearch, 
  columnHeaders, 
  incidentTypes, 
  statusTypes 
}: {
  data: Incident[]
  onSearch: (filtered: Incident[]) => void
  columnHeaders: Record<string,string>
  incidentTypes: string[]
  statusTypes: string[]
}) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string|"all">("all")
  const [statusFilter, setStatusFilter] = useState<string|"all">("all")
  const [dateFilterType, setDateFilterType] = useState<"none"|"before"|"after"|"on">("none")
  const [dateValue, setDateValue] = useState<Date>()

  const runSearch = useCallback(() => {
    const terms = query.toLowerCase().split(" ").filter(Boolean)
    const filtered = data.filter(row => {
      const textMatch = terms.every(term =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(term)
        )
      )
      const typeMatch = typeFilter === "all" ? true : row.type === typeFilter
      const statusMatch = statusFilter === "all" ? true : row.status === statusFilter

      let dateMatch = true
      if(dateFilterType !== "none" && dateValue) {
        const rowDates = ["dateReported","dateResolved"].filter(k=>row[k as keyof Incident]).map(k=>new Date(row[k as keyof Incident] as string))
        if(rowDates.length > 0){
          if(dateFilterType === "before") dateMatch = rowDates.some(d=>d < dateValue)
          if(dateFilterType === "after") dateMatch = rowDates.some(d=>d > dateValue)
          if(dateFilterType === "on") dateMatch = rowDates.some(d=>d.toDateString() === dateValue.toDateString())
        }
      }

      return textMatch && typeMatch && statusMatch && dateMatch
    })
    onSearch(filtered)
  }, [query, typeFilter, statusFilter, dateFilterType, dateValue, data, onSearch])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline"><Search className="w-4 h-4 mr-2"/> Search</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 space-y-4">
        <Input placeholder="Search keywords…" value={query} onChange={e=>setQuery(e.target.value)} />
        <div>
          <p className="text-sm font-medium mb-1">Incident Type:</p>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select type"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {incidentTypes.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Status:</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select status"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusTypes.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Select value={dateFilterType} onValueChange={val=>setDateFilterType(val as any)}>
          <SelectTrigger><SelectValue placeholder="Date Filter"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Date Filter</SelectItem>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="after">After</SelectItem>
            <SelectItem value="on">On</SelectItem>
          </SelectContent>
        </Select>
        {dateFilterType !== "none" && <Input type="date" value={dateValue?format(dateValue,"yyyy-MM-dd"):""} onChange={e=>setDateValue(new Date(e.target.value))}/>}
        <Button className="w-full" onClick={runSearch}>Apply Search</Button>
      </PopoverContent>
    </Popover>
  )
})

// ------------------------- ENTRY DRAWER -------------------------
const EntryDrawer = memo(function EntryDrawer({ 
  open, 
  onOpenChange, 
  incident, 
  onSave 
}: { 
  open:boolean; 
  onOpenChange:(val:boolean)=>void; 
  incident:Partial<Incident>|null; 
  onSave:(incident:Incident)=>void 
}) {
  const handleBack = useCallback(() => onOpenChange(false), [onOpenChange])
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent style={{ width:'30vw', maxWidth:'30vw' }} className="w-[50vw] max-w-none p-6 overflow-y-auto text-sm">
        <IncidentForm incident={incident} onBack={()=>onOpenChange(false)} onSave={onSave} />
      </SheetContent>
    </Sheet>
  )
})

// ------------------------- MAIN PAGE -------------------------
export default function IncidentsPage() {
  const { incidents, loading, error, add, update, remove } = useIncidents()
  const [view, setView] = useState<"table"|"queue"|"kanban"|"cards">("cards")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Partial<Incident>|null>(null)
  const [filteredData, setFilteredData] = useState<Incident[]>([])

  // Initialize filteredData only once when incidents first load
  useEffect(() => {
    if (incidents.length > 0 && filteredData.length === 0) {
      setFilteredData(incidents)
    }
  }, [incidents, filteredData.length])

  // FIXED: Proper handleSave function
  const handleSave = useCallback(async (incidentData: Incident) => {
    try {
      if (incidentData.incidentId) {
        // Update existing incident - separate ID from updates
        const { incidentId, ...updates } = incidentData;
        await update(incidentId, updates);
      } else {
        // Create new incident - remove incidentId entirely
        const { incidentId, ...newIncident } = incidentData;
        await add(newIncident);
      }
      setDrawerOpen(false);
      setSelectedIncident(null);
    } catch (error) {
      // Error is already handled by useIncidents hook
      console.error('Error saving incident:', error);
    }
  }, [update, add]);

  const handleCardClick = useCallback((incident: Partial<Incident>) => {
    setSelectedIncident(incident)
    setDrawerOpen(true)
  }, [])

  const handleNewButtonClick = useCallback(() => {
    setSelectedIncident(null)
    setDrawerOpen(true)
  }, [])

  // Memoized view change handlers
  const setCardsView = useCallback(() => setView("cards"), [])
  const setTableView = useCallback(() => setView("table"), [])
  const setQueueView = useCallback(() => setView("queue"), [])
  const setKanbanView = useCallback(() => setView("kanban"), [])

  return (
    <div className="p-4 space-y-4">
      {/* VIEW SWITCH */}
      <div className="flex justify-between flex-wrap gap-2 mb-4">
        <div className="flex gap-2">
          <Button variant={view === "cards" ? "default" : "outline"} onClick={setCardsView}>
            <CreditCard className="w-4 h-4 mr-2"/> Cards
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} onClick={setTableView}>
            <TableIcon className="w-4 h-4 mr-2"/> Table
          </Button>
        </div>
        <div className="flex gap-2">
          <SearchPopover 
            data={incidents} 
            onSearch={setFilteredData} 
            columnHeaders={{
              id: "ID",
              dateReported: "Date Reported",
              timeReported: "Time Reported",
              type: "Type",
              location: "Location",
              purok: "Purok / Zone",
              reportedBy: "Reported By",
              description: "Description",
              involvedParties: "Involved Parties",
              status: "Status",
              assignedOfficer: "Assigned Officer",
              dateResolved: "Date Resolved",
              notes: "Notes"
            }}
            incidentTypes={["Noise Complaint", "Theft", "Disturbance", "Traffic Violation", "Vandalism", "Curfew Violation", "Domestic Dispute", "Other"]}
            statusTypes={["Pending", "Investigating", "Resolved", "Closed"]}
          />
          <Button variant="default" onClick={()=>{ setSelectedIncident(null); setDrawerOpen(true) }}><Plus className="w-4 h-4 mr-2" /> New
                    </Button>
        </div>
      </div>

      {/* CARD LIST */}
      {view === "cards" && (
        <DynamicCardList 
          data={filteredData} 
          titleField="type" 
          statusField="status" 
          hiddenFields={["incidentId"]} 
          onCardClick={handleCardClick} 
        />
      )}
      {view === "table" && (
        <DynamicTable 
          data={filteredData} 
          columnHeaders={{
            id: "ID",
            dateReported: "Date Reported",
            timeReported: "Time Reported",
            type: "Type",
            location: "Location",
            purok: "Purok / Zone",
            reportedBy: "Reported By",
            description: "Description",
            involvedParties: "Involved Parties",
            status: "Status",
            assignedOfficer: "Assigned Officer",
            dateResolved: "Date Resolved",
            notes: "Notes"
          }} 
          onRowClick={handleCardClick} 
        />
      )}

      <EntryDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
        incident={selectedIncident} 
        onSave={handleSave} 
      />
    </div>
  )
}
