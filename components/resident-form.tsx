import { useState } from 'react';
import { ArrowLeft, Save, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Resident } from "@/app/officials/residentinformation/mockResidents"

export interface ResidentFormProps {
  resident: Partial<Resident> | null;
  onSave: (resident: Resident) => void;
  onBack?: () => void;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  contactNumber?: string;
  houseNumber?: string;
  street?: string;
  city?: string;
  familyId?: string;
  email?: string;
  [key: string]: string | undefined;
}

export default function ResidentForm({ resident, onBack, onSave }: ResidentFormProps) {
  const [formData, setFormData] = useState<Partial<Resident>>(
    resident || {
      firstName: '',
      middleName: '',
      lastName: '',
      birthDate: '',
      sex: 'Male',
      civilStatus: 'Single',
      contactNumber: '',
      email: '',
      residentType: 'Local',
      isHeadOfFamily: false,
      familyId: '',
      relationshipToHead: 'Head',
      houseNumber: '',
      street: '',
      purok: 'Purok 1',
      city: 'Davao City',
      province: 'Davao del Sur',
      vulnerableTypes: [],
      status: 'Active',
    }
  );

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'First name can only contain letters and spaces';
        return undefined;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Last name can only contain letters and spaces';
        return undefined;
      
      case 'birthDate':
        if (!value) return 'Birth date is required';
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate > today) return 'Birth date cannot be in the future';
        if (today.getFullYear() - birthDate.getFullYear() > 120) return 'Please enter a valid birth date';
        return undefined;
      
      case 'contactNumber':
        if (!value.trim()) return 'Contact number is required';
        const phoneRegex = /^(09|\+639)\d{9}$/;
        const cleanNumber = value.replace(/\D/g, '');
        if (!phoneRegex.test(cleanNumber)) return 'Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)';
        return undefined;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return undefined;
      
      case 'houseNumber':
        if (!value.trim()) return 'House number is required';
        if (!/^\d{6}$/.test(value.trim())) return 'House number must be exactly 6 digits';
        return undefined;

      
      case 'street':
        if (!value.trim()) return 'Street is required';
        return undefined;
      
      case 'city':
        if (!value.trim()) return 'City is required';
        return undefined;
      
      case 'familyId':
        if (!value.trim()) return 'Family ID is required';
        if (!/^FAM-\d{3}$/.test(value)) return 'Family ID must be in format FAM-XXX';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'birthDate', 'contactNumber', 
      'houseNumber', 'street', 'city', 'familyId'
    ];
    
    requiredFields.forEach(field => {
      const error = validateField(field, (formData as any)[field] || '');
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Optional fields validation
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) newErrors.email = emailError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof Resident, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (!formData.id) {
      formData.id = `RES-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
    
    onSave(formData as Resident);
    onBack?.();   
  };

  const handleVulnerableTypeChange = (type: string) => {
    const current = formData.vulnerableTypes || [];
    if (current.includes(type)) {
      setFormData({
        ...formData,
        vulnerableTypes: current.filter(t => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        vulnerableTypes: [...current, type],
      });
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as 0917-123-4567
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleChange('contactNumber', formatted);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg dark:hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl  text-gray-900 dark:text-gray-100">{resident ? 'Edit Resident' : 'Add New Resident'}</h2>
          <p className="text-gray-600 dark:text-gray-400">Fill in the resident information below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"/>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Birth Date *</label>
              <input
                type="date"
                name="birthDate"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Sex *</label>
              <select
                required
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'Male' | 'Female' })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Civil Status *</label>
              <select
                required
                value={formData.civilStatus}
                onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widow">Widow/Widower</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Contact Number *</label>
              <input
                type="tel"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
                placeholder="0917-123-4567"
                maxLength={13}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
               className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Resident Type *</label>
              <select
                required
                value={formData.residentType}
                onChange={(e) => setFormData({ ...formData, residentType: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              >
                <option value="Local">Local</option>
                <option value="Boarder">Boarder</option>
                <option value="Old Resident">Old Resident</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">House Number *</label>
              <input
                type="text"
                name="houseNumber"
                required
                value={formData.houseNumber}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Street *</label>
              <input
                type="text"
                name="street"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Purok *</label>
              <select
                required
                value={formData.purok}
                onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              >
                <option value="Purok 1">Purok 1</option>
                <option value="Purok 2">Purok 2</option>
                <option value="Purok 3">Purok 3</option>
                <option value="Purok 4">Purok 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Province *</label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Family Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Family ID *</label>
              <input
                type="text"
                name="familyId"
                required
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400"
                placeholder="FAM-001"
              />
              {errors.familyId && <p className="text-red-500 text-xs mt-1">{errors.familyId}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Relationship to Head *</label>
              <select
                required
                value={formData.relationshipToHead}
                onChange={(e) => setFormData({ ...formData, relationshipToHead: e.target.value })}
                className="
                    w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400" >
                <option value="Head">Head</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Boarder">Boarder</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                checked={formData.isHeadOfFamily}
                onChange={(e) => setFormData({ ...formData, isHeadOfFamily: e.target.checked })}
                className="
                   w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Head of Family</label>
            </div>
          </div>
        </div>

        {/* Vulnerable Sector */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Vulnerable Sector Classification</h3>
          <div className="space-y-2">
            {['PWD', 'Senior Citizen', 'Solo Parent', 'Indigent'].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.vulnerableTypes?.includes(type)}
                  onChange={() => handleVulnerableTypeChange(type)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="rounded-lg border shadow-sm p-6
          bg-white text-gray-800 border-gray-200
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Status</h3>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 rounded-lg border
                    bg-white text-gray-900 border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600
                    dark:focus:ring-blue-400" >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred Out">Transferred Out</option>
            <option value="Deceased">Deceased</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-5 h-5" />
            {resident ? 'Update Resident' : 'Add Resident'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
