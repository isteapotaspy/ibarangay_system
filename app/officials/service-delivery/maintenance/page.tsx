'use client'

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Search } from "lucide-react"
import { Plus } from "lucide-react";

// SHADCN UI
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

// Dynamic views
import DynamicTable from "@/components/dynamicViewers/dynamic-table";
import DynamicQueue from "@/components/dynamicViewers/dynamic-queue";
import DynamicKanban from "@/components/dynamicViewers/dynamic-kanban";

// Hooks
import { useMaintenance } from "@/hooks/use-maintenance";
import { MaintenanceEntry } from "@/amplify/backend/functions/maintenanceApi/src/Maintenance";

// Components
import MaintenanceForm from "@/components/maintenance-form";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Lucide Icons
import { Table as TableIcon, ListChecks, KanbanSquare } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

function MaintenanceSearchPopover({ 
  data, 
  onSearch, 
  columnHeaders 
}: { 
  data: any[]; 
  onSearch: (filtered: any[]) => void; 
  columnHeaders: Record<string, string> 
}) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [dateFilterType, setDateFilterType] = useState("none");
  const [dateValue, setDateValue] = useState<Date | undefined>();

  const runSearch = () => {
    const terms = query.split(" ").map(t => t.toLowerCase()).filter(Boolean);

    const filtered = data.filter(row => {
      const textMatch = terms.every(term => 
        Object.keys(row).some(k => String(row[k]).toLowerCase().includes(term))
      );

      let dateMatch = true;
      if (dateFilterType !== "none" && dateValue) {
        const rowDates = Object.keys(row)
          .filter(k => row[k] && !isNaN(Date.parse(row[k])))
          .map(k => new Date(row[k]));
        const target = new Date(dateValue);
        if (dateFilterType === "before") dateMatch = rowDates.some(d => d < target);
        if (dateFilterType === "after") dateMatch = rowDates.some(d => d > target);
        if (dateFilterType === "on") dateMatch = rowDates.some(d => d.toDateString() === target.toDateString());
      }

      const columnMatch = filterBy === "all" ? true : String(row[filterBy]).toLowerCase().includes(query.toLowerCase());

      return textMatch && dateMatch && columnMatch;
    });

    onSearch(filtered);
  };

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
        <Input placeholder="Search keywords…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Columns</SelectItem>
            {data.length > 0 && Object.keys(data[0]).map(col => (
              <SelectItem key={col} value={col}>{columnHeaders[col] || col.replace(/([A-Z])/g, " $1")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilterType} onValueChange={setDateFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Date Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Date Filter</SelectItem>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="after">After</SelectItem>
            <SelectItem value="on">On</SelectItem>
          </SelectContent>
        </Select>

        {dateFilterType !== "none" && (
          <Calendar mode="single" selected={dateValue} onSelect={setDateValue} className="rounded-md border" />
        )}

        <Button className="w-full" onClick={runSearch}>Apply Search</Button>
      </PopoverContent>
    </Popover>
  );
}

export default function MaintenancePage() {
  const [view, setView] = useState<"table" | "queue" | "kanban">("queue");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // CRUD hook
  const { entries, loading, error, refresh, add, update, remove } = useMaintenance();

  // Sync filtered data
  useEffect(() => {
    setFilteredData(entries);
  }, [entries]);

  const columnHeaders: Record<string, string> = {
    id: "ID",
    type: "Type",
    status: "Status",
    priority: "Priority",
    assignedTo: "Assigned To",
    lastServiced: "Last Serviced",
    nextServiceDue: "Next Service Due",
    scheduledDate: "Scheduled Date",
    issue: "Issue",
  };

  // Format data dates
  const formattedData = filteredData.map(d => ({
    ...d,
    lastServiced: d.lastServiced ? format(new Date(d.lastServiced), "yyyy-MM-dd") : "",
    nextServiceDue: d.nextServiceDue ? format(new Date(d.nextServiceDue), "yyyy-MM-dd") : "",
    scheduledDate: d.scheduledDate ? format(new Date(d.scheduledDate), "yyyy-MM-dd") : "",
  }));

  const queueData = [...formattedData].sort(
    (a, b) =>
    (a.priority ?? 0) - (b.priority ?? 0) ||
    String(a.id).localeCompare(String(b.id))
  );

  // Handlers
  const handleSave = async (entry: any) => {
    try {
      if (entry.id) await update(entry.id, entry);
      else await add(entry);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save entry.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete entry.");
    }
  };

  // Show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6">
        <h1 className="text-2xl font-bold">Maintenance and Repairs</h1>
        <div className="flex gap-2">
          <MaintenanceSearchPopover data={entries} onSearch={setFilteredData} columnHeaders={columnHeaders} />
          <Button variant="outline" onClick={refresh}>Refresh</Button>
          <Button variant="default" onClick={() => { setSelectedEntry(null); setDrawerOpen(true); }}><Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
      </div>
      {/* SWITCH BUTTONS */}
      <div className="flex items-center justify-start px-6 gap-2">
        <Button variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
          <TableIcon className="w-4 h-4 mr-2" /> List
        </Button>
        <Button variant={view === "queue" ? "default" : "outline"} onClick={() => setView("queue")}>
          <ListChecks className="w-4 h-4 mr-2" /> By Priority
        </Button>
        <Button variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}>
          <KanbanSquare className="w-4 h-4 mr-2" /> By Status
        </Button>
      </div>

      {/* VIEWS */}
      {view === "table" && (
        <DynamicTable
          data={formattedData}
          columnHeaders={columnHeaders}
          onRowClick={(row) => { setSelectedEntry(row); setDrawerOpen(true); }}
        />
      )}
      {view === "queue" && (
        <DynamicQueue
          data={queueData}
          renderCard={(row) => {
            const { theme } = useTheme();

            return (
              <div
                className={`
                  rounded-lg shadow p-4 cursor-pointer transition 
                  hover:shadow-lg
                  ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-800"}
                `}
                onClick={() => { setSelectedEntry(row); setDrawerOpen(true); }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{row.type}</span>
                  <span className="text-sm font-medium text-gray-500">Priority {row.priority}</span>
                </div>
                <div className="text-sm mb-1">ID: {row.id}</div>
                <div className="text-sm mb-1">Status: {row.status}</div>
                <div className="text-sm mb-1">Assigned: {row.assignedTo}</div>
                {row.issue && <div className="text-sm text-purple-600 mt-2">{row.issue}</div>}
                {row.scheduledDate && (
                  <div className="text-xs text-gray-500 mt-1">Scheduled: {row.scheduledDate}</div>
                )}
              </div>
            );
          }}
        />
      )}
      {view === "kanban" && (
        <DynamicKanban
          data={formattedData}
          onCardClick={(card) => { setSelectedEntry(card); setDrawerOpen(true); }}
        />
      )}

      {/* ENTRY SHEET */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="p-6 max-w-md overflow-y-auto">
          <MaintenanceForm
            entry={selectedEntry}
            onSave={handleSave}
            onBack={() => setDrawerOpen(false)}
            onDelete={handleDelete}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
