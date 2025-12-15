'use client'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Incident } from "@/app/officials/peaceandorder/incidents/mockIncidents"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface IncidentFormProps {
  incident: Partial<Incident> | null
  onBack: () => void
  onSave: (incident: Incident) => void
}

export default function IncidentForm({ incident, onBack, onSave}: IncidentFormProps) {
  const [formData, setFormData] = useState<Partial<Incident>>({
    incidentId: incident?.incidentId, // ✅ Fixed: use incidentId
    dateReported: incident?.dateReported || new Date().toISOString().split('T')[0],
    timeReported: incident?.timeReported || new Date().toTimeString().slice(0, 5),
    type: incident?.type || 'Noise Complaint',
    location: incident?.location || '',
    purok: incident?.purok || 'Purok 1',
    reportedBy: incident?.reportedBy || '',
    description: incident?.description || '',
    involvedParties: incident?.involvedParties || [],
    status: incident?.status || 'Pending',
    assignedOfficer: incident?.assignedOfficer || '',
    dateResolved: incident?.dateResolved,
    notes: incident?.notes || '',
  })

  const [partyInput, setPartyInput] = useState('')

  const handleChange = (key: keyof Incident, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const addParty = () => {
    if (!partyInput.trim()) return
    setFormData(prev => ({
      ...prev,
      involvedParties: [...(prev.involvedParties || []), partyInput],
    }))
    setPartyInput('')
  }

  const removeParty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      involvedParties: (prev.involvedParties || []).filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Cast to full Incident
    const completeIncident: Incident = {
      ...formData,
      involvedParties: formData.involvedParties || [],
      dateResolved: formData.dateResolved,
      notes: formData.notes || '',
    } as Incident

    onSave(completeIncident)
    onBack()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} className="p-2 rounded-lg dark:bg-black dark:text-gray-100 dark:hover:bg-white dark:hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-gray-100">{incident ? 'Edit Incident' : 'Report New Incident'}</h2>
          <p className="text-gray-600 dark:text-gray-400">Fill in the incident details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Info */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4  font-semibold text-gray-900 dark:text-gray-100">Incident Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateReported" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Date Reported *</Label>
              <Input
                id="dateReported"
                type="date"
                required
                value={formData.dateReported}
                onChange={e => handleChange('dateReported', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="timeReported" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Time Reported *</Label>
              <Input
                id="timeReported"
                type="time"
                required
                value={formData.timeReported}
                onChange={e => handleChange('timeReported', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Incident Type *</Label>
              <Select
                value={formData.type}
                onValueChange={val => handleChange('type', val)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Disturbance">Disturbance</SelectItem>
                  <SelectItem value="Traffic Violation">Traffic Violation</SelectItem>
                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                  <SelectItem value="Curfew Violation">Curfew Violation</SelectItem>
                  <SelectItem value="Domestic Dispute">Domestic Dispute</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purok" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Purok / Zone *</Label>
              <Select
                value={formData.purok}
                onValueChange={val => handleChange('purok', val)}
              >
                <SelectTrigger id="purok">
                  <SelectValue placeholder="Select Purok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purok 1">Purok 1</SelectItem>
                  <SelectItem value="Purok 2">Purok 2</SelectItem>
                  <SelectItem value="Purok 3">Purok 3</SelectItem>
                  <SelectItem value="Purok 4">Purok 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="location" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Location *</Label>
              <Input
                id="location"
                type="text"
                required
                placeholder="Specific location"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reportedBy" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Reported By *</Label>
              <Input
                id="reportedBy"
                type="text"
                required
                placeholder="Name of reporter"
                value={formData.reportedBy}
                onChange={e => handleChange('reportedBy', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="assignedOfficer" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Assigned Officer *</Label>
              <Input
                id="assignedOfficer"
                type="text"
                required
                placeholder="Officer assigned"
                value={formData.assignedOfficer}
                onChange={e => handleChange('assignedOfficer', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                required
                placeholder="Detailed description of incident"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Involved Parties */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 font-semibold text-gray-900 dark:text-gray-100">Involved Parties</h3>

          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Add party (name - role)"
              value={partyInput}
              onChange={e => setPartyInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addParty())}
            />
            <Button type="button" onClick={addParty}>Add</Button>
          </div>

          <div className="space-y-1">
            {(formData.involvedParties || []).map((party, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{party}</span>
                <Button variant="destructive" size="sm" onClick={() => removeParty(index)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Notes */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 font-semibold text-gray-900 dark:text-gray-100">Status & Notes</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="status" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Status *</Label>
              <Select
                value={formData.status} 
                onValueChange={val => handleChange('status', val as Incident['status'])}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Investigating">Investigating</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Notes / Remarks</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Additional notes or actions"
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" variant="default" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <Save className="w-5 h-5" />
            {incident ? 'Update Incident' : 'Report Incident'}
          </Button>
          <Button type="button" variant="outline" onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 ">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
