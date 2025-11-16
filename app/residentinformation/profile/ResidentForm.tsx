"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type HouseholdMember = {
  name: string;
  dob: string; // YYYY-MM-DD
  gender: string; // Male | Female
  relationship: string;
  occupation?: string;
  status?: string; // Student | Employed | Not student
  school?: string;
};

interface ResidentFormProps {
  residentHead: Record<string, string>;
  setResidentHead: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  residentHousehold: HouseholdMember[];
  setResidentHousehold: React.Dispatch<React.SetStateAction<HouseholdMember[]>>;
  addHouseholdMember: (setter: any, list: HouseholdMember[]) => void;
  updateMember: (
    setter: any,
    list: HouseholdMember[],
    i: number,
    field: keyof HouseholdMember,
    value: string
  ) => void;
}

export default function ResidentForm({
  residentHead,
  setResidentHead,
  residentHousehold,
  setResidentHousehold,
  addHouseholdMember,
  updateMember,
}: ResidentFormProps) {
  const headFields = [
    "Full Legal Name",
    "Date of Birth",
    "Place of Birth",
    "Sex/Gender",
    "Civil Status",
    "Nationality",
    "Current Address",
    "Mobile Number",
    "Alternate Contact Number",
    "Email Address",
    "Occupation/Income Source",
    "Date of Residency",
    "Home Ownership Proof",
    "Voter Status",
    "Educational Attainment",
    "Emergency Contact Person",
  ];

  const memberFields: (keyof HouseholdMember | string)[] = [
    "Full Name",
    "Date of Birth",
    "Sex/Gender",
    "Relationship",
    "Status", // Student / Employed / Not student
    "Occupation",
    "School Attending",
  ];

  // helpers to update head fields safely
  const setHeadField = (field: string, value: string) => {
    setResidentHead((prev) => ({ ...prev, [field]: value }));
  };

  // phone input filter helper
  const onlyDigits = (v: string) => v.replace(/\D/g, "");

  return (
    <>
      <Section title="Head of Household">
        {headFields.map((field) => {
          if (field === "Sex/Gender") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Select
                  value={residentHead[field] || ""}
                  onValueChange={(val) => setHeadField(field, val)}
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

          if (field === "Date of Birth" || field === "Date of Residency") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Input
                  type="date"
                  value={residentHead[field] || ""}
                  onChange={(e) => setHeadField(field, e.target.value)}
                />
              </div>
            );
          }

          if (field === "Mobile Number" || field === "Alternate Contact Number") {
            return (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <Input
                  value={residentHead[field] || ""}
                  onChange={(e) => setHeadField(field, onlyDigits(e.target.value))}
                  placeholder={field}
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
                  value={residentHead[field] || ""}
                  onChange={(e) => setHeadField(field, e.target.value)}
                  placeholder={field}
                />
              </div>
            );
          }

          return (
            <InputField
              key={field}
              label={field}
              value={residentHead[field] || ""}
              onChange={(val: string) => setHeadField(field, val)}
            />
          );
        })}
      </Section>

      <Section title="Household Members">
        <ScrollArea className="h-64 rounded-md border p-4">
          {residentHousehold.map((m, i) => (
            <div key={i} className="flex flex-col mb-4 space-y-2">
              <span className="font-semibold">#{i + 1}</span>

              {/* Full Name */}
              <InputField
                label="Full Name"
                value={m.name}
                onChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "name", val)}
              />

              {/* DOB */}
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={m.dob || ""}
                  onChange={(e) => updateMember(setResidentHousehold, residentHousehold, i, "dob", e.target.value)}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Sex/Gender</Label>
                <Select
                  value={m.gender || ""}
                  onValueChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "gender", val)}
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

              {/* Relationship */}
              <InputField
                label="Relationship"
                value={m.relationship}
                onChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "relationship", val)}
              />

              {/* Status (Student / Employed / Not student) */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={m.status || "Not student"}
                  onValueChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "status", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Not student">Not student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occupation */}
              <InputField
                label="Occupation"
                value={m.occupation || ""}
                onChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "occupation", val)}
              />

              {/* School (if student) */}
              <InputField
                label="School Attending"
                value={m.school || ""}
                onChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "school", val)}
              />
            </div>
          ))}
        </ScrollArea>

        <Button onClick={() => addHouseholdMember(setResidentHousehold, residentHousehold)}>➕ Add Member</Button>
      </Section>
    </>
  );
}

// Section & InputField
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
