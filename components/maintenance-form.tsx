'use client'

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export interface MaintenanceFormProps {
  entry: any | null;
  onSave: (data: any) => void;
  onBack?: () => void;
  onDelete?: (id: string) => void;
}

export default function MaintenanceForm({ entry, onSave, onBack, onDelete }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<any>({
    type: "",
    status: "",
    priority: 1,
    assignedTo: "",
    issue: "",
    lastServiced: "",
    nextServiceDue: "",
    scheduledDate: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (entry) setFormData(entry);
    else
      setFormData({
        type: "",
        status: "",
        priority: 1,
        assignedTo: "",
        issue: "",
        lastServiced: "",
        nextServiceDue: "",
        scheduledDate: "",
      });
  }, [entry]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!formData.type || !formData.status || !formData.assignedTo) {
      alert("Please fill all required fields (Type, Status, Assigned To)!");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const saved = entry?.id
      ? formData
      : { ...formData, id: undefined };

    onSave(saved);
  };

  const handleDelete = () => {
    if (entry?.id && onDelete) {
      if (confirm("Are you sure you want to delete this entry?")) {
        onDelete(entry.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {entry?.id ? "Edit Entry" : "Add New Entry"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the maintenance information below
          </p>
        </div>
        {entry?.id && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
            title="Delete Entry"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Type *</label>
              <Input
                required
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Status *</label>
              <Input
                required
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Assigned To *</label>
              <Input
                required
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Issue</label>
              <Input
                value={formData.issue}
                onChange={(e) => handleChange("issue", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Priority</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.priority}
                onChange={(e) => handleChange("priority", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Last Serviced</label>
              <Input
                type="date"
                value={formData.lastServiced ? format(new Date(formData.lastServiced), "yyyy-MM-dd") : ""} 
                onChange={(e) => handleChange("lastServiced", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Next Service Due</label>
              <Input
                type="date"
                value={formData.nextServiceDue ? format(new Date(formData.nextServiceDue), "yyyy-MM-dd") : ""} 
                onChange={(e) => handleChange("nextServiceDue", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100">Scheduled Date</label>
              <Input
                type="date"
                value={formData.scheduledDate ? format(new Date(formData.scheduledDate), "yyyy-MM-dd") : ""} 
                onChange={(e) => handleChange("scheduledDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-5 h-5" />
            {entry?.id ? "Update Entry" : "Add Entry"}
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:text-black"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
