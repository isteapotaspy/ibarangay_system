// app/residentinformation/LandlordForm.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HouseholdMember } from "./ResidentForm";

interface LandlordFormProps {
  landlordInfo: Record<string, string>;
  setLandlordInfo: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  propertyDetails: Record<string, string>;
  setPropertyDetails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  tenantInfo: Record<string, string>;
  setTenantInfo: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  householdMembers: HouseholdMember[];
  setHouseholdMembers: React.Dispatch<React.SetStateAction<HouseholdMember[]>>;
  addHouseholdMember: (setter: any, list: HouseholdMember[]) => void;
  updateMember: (
    setter: any,
    list: HouseholdMember[],
    i: number,
    field: keyof HouseholdMember,
    value: string
  ) => void;
}

export default function LandlordForm({
  landlordInfo,
  setLandlordInfo,
  propertyDetails,
  setPropertyDetails,
  tenantInfo,
  setTenantInfo,
  householdMembers,
  setHouseholdMembers,
  addHouseholdMember,
  updateMember,
}: LandlordFormProps) {
  const landlordFields = [
    "Full Legal Name",
    "Current Address",
    "Mobile Number",
    "Alternate Contact Number",
    "Email Address",
    "Proof of Ownership",
    "Emergency Contact Person",
    "Date of Registration",
  ];

  const propertyFields = [
    "Rental Property Address",
    "Type of Property",
    "Number of Units/Rooms",
    "Land Title or Tax Declaration No.",
  ];

  const tenantFields = [
    "Full Legal Name",
    "Date of Birth",
    "Place of Birth",
    "Sex/Gender",
    "Civil Status",
    "Nationality",
    "Previous Address",
    "Mobile Number",
    "Occupation",
    "Voter Status",
    "Email Address",
  ];

  const memberFields: (keyof HouseholdMember | string)[] = [
    "Full Name",
    "Date of Birth",
    "Sex/Gender",
    "Relationship",
    "Occupation",
    "School Attending",
  ];

  const validateInput = (label: string, value: string) => {
    if (label.toLowerCase().includes("email")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (label.toLowerCase().includes("mobile") || label.toLowerCase().includes("contact")) return /^\d*$/.test(value); // allow empty while typing
    if (label.toLowerCase().includes("date")) return /^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(value);
    return true;
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold">Landlady/Landlord Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {landlordFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>{field}</Label>
              {field === "Sex/Gender" ? (
                <Select value={landlordInfo[field] || ""} onValueChange={(val) => setLandlordInfo((prev) => ({ ...prev, [field]: val }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={field}
                  value={landlordInfo[field] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateInput(field, val)) setLandlordInfo((prev) => ({ ...prev, [field]: val }));
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>{field}</Label>
              <Input placeholder={field} value={propertyDetails[field] || ""} onChange={(e) => setPropertyDetails((prev) => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Tenant Details</h3>
        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                {field === "Sex/Gender" ? (
                  <Select value={tenantInfo["Sex/Gender"] || ""} onValueChange={(val) => setTenantInfo((prev) => ({ ...prev, "Sex/Gender": val }))}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === "Date of Birth" ? (
                  <Input placeholder="DD/MM/YYYY" value={tenantInfo[field] || ""} onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(val)) setTenantInfo((prev) => ({ ...prev, [field]: val }));
                  }} />
                ) : (
                  <Input placeholder={field} value={tenantInfo[field] || ""} onChange={(e) => {
                    const val = e.target.value;
                    if (validateInput(field, val)) setTenantInfo((prev) => ({ ...prev, [field]: val }));
                  }} />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Household Members</h3>
        <ScrollArea className="h-64 rounded-md border p-4">
          {householdMembers.map((m, i) => (
            <div key={i} className="flex flex-col mb-4 space-y-2">
              <span className="font-semibold">#{i + 1}</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberFields.map((field) => {
                  if (field === "Sex/Gender") {
                    return (
                      <div key={String(field)} className="space-y-2">
                        <Label>{String(field)}</Label>
                        <Select value={m.gender || ""} onValueChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "gender", val)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  if (field === "Date of Birth") {
                    return (
                      <div key={String(field)} className="space-y-2">
                        <Label>{String(field)}</Label>
                        <Input placeholder="DD/MM/YYYY" value={m.dob} onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(val)) updateMember(setHouseholdMembers, householdMembers, i, "dob", val);
                        }} />
                      </div>
                    );
                  }

                  const value =
                    field === "Full Name"
                      ? m.name
                      : field === "Relationship"
                      ? m.relationship
                      : field === "Occupation"
                      ? m.occupation || ""
                      : m.school || "";

                  return (
                    <div key={String(field)} className="space-y-2">
                      <Label>{String(field)}</Label>
                      <Input placeholder={String(field)} value={value} onChange={(e) => {
                        const val = e.target.value;
                        const key: keyof HouseholdMember =
                          field === "Full Name"
                            ? "name"
                            : field === "Relationship"
                            ? "relationship"
                            : field === "Occupation"
                            ? "occupation"
                            : "school";
                        updateMember(setHouseholdMembers, householdMembers, i, key, val);
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        <Button onClick={() => addHouseholdMember(setHouseholdMembers, householdMembers)}>➕ Add Member</Button>
      </div>
    </>
  );
}
