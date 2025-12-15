import { ArrowLeft, Edit, QrCode, User, Home, Heart, FileText, Calendar } from 'lucide-react';
import { Resident } from "@/app/officials/residentinformation/mockResidents"

import { Button } from "@/components/ui/button"


interface ResidentProfileProps {
  resident: Resident;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ResidentProfile({ resident, onBack, onEdit, onDelete }: ResidentProfileProps) {
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg dark:hover:bg-white dark:hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl text-gray-900 dark:text-gray-100">Resident Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">{resident.id || 'N/A'}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={onDelete} className="hover:bg-red-950 bg-red-900 text-white">Delete</Button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-5 h-5" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center 
          text-gray-800  dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl">{`${resident.firstName || ''} ${resident.middleName || ''} ${resident.lastName || ''}`}</h3>
            <p className="text-gray-600 dark:text-gray-300">{resident.id || 'N/A'}</p>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                resident.status === 'Active' ? 'bg-green-100 text-green-700' :
                resident.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                resident.status === 'Transferred Out' ? 'bg-yellow-100 text-yellow-700' :
                resident.status === 'Deceased' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {resident.status || 'N/A'}
              </span>
            </div>

            {/* QR Code */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-100 ">
              <QrCode className="w-24 h-24 mx-auto text-gray-400" />
              <p className="text-xs text-gray-600 mt-2 dark:text-gray-400">{resident.qrCode || 'N/A'}</p>
            </div>
          </div>

          {/* Vulnerable Sector */}
          {resident.vulnerableTypes && resident.vulnerableTypes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-orange-600" />
                <h4>Vulnerable Sector</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {resident.vulnerableTypes.map((type) => (
                  <span key={type} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h4>Personal Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Birth Date</p>
                <p>{resident.birthDate || 'N/A'} ({calculateAge(resident.birthDate)} years old)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300" >Sex</p>
                <p>{resident.sex || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Civil Status</p>
                <p>{resident.civilStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Resident Type</p>
                <p>{resident.residentType || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4>Contact Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Contact Number</p>
                <p>{resident.contactNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                <p>{resident.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue-600" />
              <h4>Address Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">House Number</p>
                <p>{resident.houseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Street</p>
                <p>{resident.street || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Purok / Zone</p>
                <p>{resident.purok || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">City</p>
                <p>{resident.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Province</p>
                <p>{resident.province || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
