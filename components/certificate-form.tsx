import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { Resident } from "@/amplify/backend/functions/residentsApi/src/Resident"

interface Certificate {
  id?: string
  residentId: string
  residentName: string
  familyId: string
  certificateType: string
  purpose: string
  dateRequested: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  assignedOfficer: string
  notes?: string
  captainName?: string
  secretaryName?: string
  captainSignature?: string
  secretarySignature?: string
  useDigitalSignature?: boolean
}

interface Official {
  id: string
  fullName: string
  position: string
  status: string
  signatureImage?: string
}

interface CertificateFormProps {
  certificate: Partial<Certificate> | null;
  onSave: (certificate: Certificate) => void;
  onBack?: () => void;
  activeOfficials: { captain?: Official; secretary?: Official };
}

export default function CertificateForm({ certificate, onBack, onSave, activeOfficials }: CertificateFormProps) {
  const [formData, setFormData] = useState<Partial<Certificate>>(
    certificate || {
      residentId: '',
      residentName: '',
      familyId: '',
      certificateType: 'Barangay Clearance',
      purpose: '',
      dateRequested: new Date().toISOString().split('T')[0],
      status: 'Pending',
      assignedOfficer: activeOfficials.secretary?.fullName || '',
      notes: '',
    }
  );

  const [residentSearch, setResidentSearch] = useState('');
  const [showResidentList, setShowResidentList] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch residents from backend
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch('/amplify/backend/functions/residentsApi/src/Resident');
      if (!response.ok) throw new Error('Failed to fetch residents');
      const data = await response.json();
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const filteredResidents = residents.filter(r => 
    r.firstName.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.lastName.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.residentId.toLowerCase().includes(residentSearch.toLowerCase())
  );

  const handleSelectResident = (resident: Resident) => {
    setFormData({
      ...formData,
      residentId: resident.residentId,
      residentName: `${resident.firstName} ${resident.lastName}`,
      familyId: resident.familyId,
    });
    setResidentSearch(`${resident.firstName} ${resident.lastName}`);
    setShowResidentList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.residentId || !formData.certificateType || !formData.purpose) {
        alert('Please fill in all required fields');
        return;
      }

      const certificateData: Certificate = {
        id: formData.id,
        residentId: formData.residentId!,
        residentName: formData.residentName!,
        familyId: formData.familyId!,
        certificateType: formData.certificateType!,
        purpose: formData.purpose!,
        dateRequested: formData.dateRequested!,
        status: formData.status as 'Pending' | 'Approved' | 'Rejected' | 'Completed',
        assignedOfficer: formData.assignedOfficer!,
        notes: formData.notes,
      };

      await onSave(certificateData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl">{certificate?.id ? 'Edit Request' : 'New Certificate Request'}</h2>
          <p className="text-gray-600 dark:text-gray-500">Fill in the request details below</p>
        </div>  
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6  text-gray-800
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Resident Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700  dark:text-gray-300 mb-2">Search Resident *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={residentSearch}
                  onChange={(e) => {
                    setResidentSearch(e.target.value);
                    setShowResidentList(true);
                  }}
                  onFocus={() => setShowResidentList(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name or ID"
                />
                {showResidentList && residentSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto *:text-gray-800
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                    {filteredResidents.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500  dark:text-gray-100">No residents found</div>
                    ) : (
                      filteredResidents.map((resident) => (
                        <div
                          key={resident.residentId}
                          onClick={() => handleSelectResident(resident)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <p className="text-sm">{`${resident.firstName} ${resident.lastName}`}</p>
                          <p className="text-xs text-gray-500">{resident.residentId} - {resident.purok}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            {formData.residentId && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-gray-800
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600  dark:text-gray-100">Resident ID</p>
                    <p>{formData.residentId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600  dark:text-gray-100">Family ID</p>
                    <p>{formData.familyId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600  dark:text-gray-100">Name</p>
                    <p>{formData.residentName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-800
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4  dark:text-gray-100">Certificate Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2  dark:text-gray-300">Certificate Type *</label>
              <select
                required
                value={formData.certificateType}
                onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                className="w-full px-4  dark:text-gray-400 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-800 dark:bg-gray-800"
              >
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Certificate of Indigency">Certificate of Indigency</option>
                <option value="Certificate of Residency">Certificate of Residency</option>
                <option value="Business Clearance">Business Clearance</option>
                <option value="Certificate for Employment">Certificate for Employment</option>
                <option value="Certificate for Scholarship">Certificate for Scholarship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700  dark:text-gray-300 mb-2">Date Requested *</label>
              <input
                type="date"
                required
                value={formData.dateRequested}
                onChange={(e) => setFormData({ ...formData, dateRequested: e.target.value })}
                className="w-full px-4 py-2 border dark:text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2  dark:text-gray-300">Purpose *</label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Employment requirement, Loan application"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6  text-gray-800
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4  dark:text-gray-100">Processing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700  dark:text-gray-300 mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border  dark:text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 text-gray-800 dark:bg-gray-800"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700  dark:text-gray-300 mb-2">Assigned Officer *</label>
              <input
                type="text"
                required
                value={formData.assignedOfficer}
                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                className="w-full px-4 py-2 dark:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2  dark:text-gray-300">Notes / Remarks</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : (certificate?.id ? 'Update Request' : 'Submit Request')}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed dark:hover:text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}