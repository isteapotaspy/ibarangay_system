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
    "Date of Birth",
    "Current Address",
    "Mobile Number",
    "Alternate Contact Number",
    "Email Address",
    "Proof of Ownership",
    "Emergency Contact Person",
    "Date of Registration",
    "Lives in this property", // Yes/No
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

  const onlyDigits = (v: string) => v.replace(/\D/g, "");

  return (
    <>
      <Section title="Landlady/Landlord Details">
        {landlordFields.map((field) => {
          if (field === "Sex/Gender") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Select
                  value={landlordInfo[field] || ""}
                  onValueChange={(val) => setLandlordInfo((p) => ({ ...p, [field]: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field === "Lives in this property") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Select
                  value={landlordInfo[field] || ""}
                  onValueChange={(val) => setLandlordInfo((p) => ({ ...p, [field]: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field === "Date of Birth" || field === "Date of Registration") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Input
                  type="date"
                  value={landlordInfo[field] || ""}
                  onChange={(e) => setLandlordInfo((p) => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            );
          }

          if (field === "Mobile Number" || field === "Alternate Contact Number") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Input
                  value={landlordInfo[field] || ""}
                  onChange={(e) => setLandlordInfo((p) => ({ ...p, [field]: onlyDigits(e.target.value) }))}
                />
              </div>
            );
          }

          if (field === "Email Address") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Input
                  type="email"
                  value={landlordInfo[field] || ""}
                  onChange={(e) => setLandlordInfo((p) => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            );
          }

          return (
            <InputField
              key={field}
              label={field}
              value={landlordInfo[field] || ""}
              onChange={(val: string) => setLandlordInfo((p) => ({ ...p, [field]: val }))}
            />
          );
        })}
      </Section>

      <Section title="Property Details">
        {propertyFields.map((field) => (
          <InputField key={field} label={field} value={propertyDetails[field] || ""} onChange={(val) => setPropertyDetails((p) => ({ ...p, [field]: val }))} />
        ))}
      </Section>

      <Section title="Tenant Details">
        <ScrollArea className="h-64 rounded-md border p-4">
          {tenantFields.map((field) => {
            if (field === "Sex/Gender") {
              return (
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  <Select value={tenantInfo["Sex/Gender"] || ""} onValueChange={(val) => setTenantInfo((p) => ({ ...p, "Sex/Gender": val }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
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
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  <Input type="date" value={tenantInfo[field] || ""} onChange={(e) => setTenantInfo((p) => ({ ...p, [field]: e.target.value }))} />
                </div>
              );
            }

            if (field === "Mobile Number") {
              return (
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  <Input value={tenantInfo[field] || ""} onChange={(e) => setTenantInfo((p) => ({ ...p, [field]: e.target.value.replace(/\D/g, "") }))} />
                </div>
              );
            }

            return <InputField key={field} label={field} value={tenantInfo[field] || ""} onChange={(val) => setTenantInfo((p) => ({ ...p, [field]: val }))} />;
          })}
        </ScrollArea>
      </Section>

      <Section title="Household Members">
        <ScrollArea className="h-64 rounded-md border p-4">
          {householdMembers.map((m, i) => (
            <div key={i} className="flex flex-col mb-4 space-y-2">
              <span className="font-semibold">#{i + 1}</span>

              <InputField
                label="Full Name"
                value={m.name}
                onChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "name", val)}
              />

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={m.dob || ""} onChange={(e) => updateMember(setHouseholdMembers, householdMembers, i, "dob", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Sex/Gender</Label>
                <Select value={m.gender || ""} onValueChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "gender", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <InputField label="Relationship" value={m.relationship} onChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "relationship", val)} />

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={m.status || "Not student"} onValueChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "status", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Not student">Not student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <InputField label="Occupation" value={m.occupation || ""} onChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "occupation", val)} />
              <InputField label="School Attending" value={m.school || ""} onChange={(val) => updateMember(setHouseholdMembers, householdMembers, i, "school", val)} />
            </div>
          ))}
        </ScrollArea>

        <Button onClick={() => addHouseholdMember(setHouseholdMembers, householdMembers)}>➕ Add Member</Button>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={label} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
