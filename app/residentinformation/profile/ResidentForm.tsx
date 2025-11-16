// app/residentinformation/ResidentForm.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MemberStatus = "Student" | "Employed" | "Not a student (Other)" | "";

export type HouseholdMember = {
  name: string;
  dob: string;
  gender: string;
  relationship: string;
  status?: MemberStatus; // NEW field
  occupation?: string;
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
    "Date of Birth", // expect DD/MM/YYYY
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
    "Status", // NEW: Student / Employed / Not a student (Other)
    // occupation or school will be conditionally shown below
  ];

  // Helper: safe getter for household member fields
  const getMemberField = (m: HouseholdMember, field: string) => {
    switch (field) {
      case "Full Name":
        return m.name;
      case "Date of Birth":
        return m.dob;
      case "Sex/Gender":
        return m.gender;
      case "Relationship":
        return m.relationship;
      case "Status":
        return m.status || "";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Head of household */}
      <div className="space-y-4">
        <h3 className="font-semibold">Head of Household</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {headFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>{field}</Label>

              {field === "Sex/Gender" ? (
                <Select
                  value={residentHead[field] || ""}
                  onValueChange={(val) => setResidentHead((prev) => ({ ...prev, [field]: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === "Date of Birth" ? (
                <Input
                  placeholder="DD/MM/YYYY"
                  value={residentHead[field] || ""}
                  onChange={(e) => setResidentHead((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              ) : (
                <Input
                  placeholder={String(field)}
                  value={residentHead[field] || ""}
                  onChange={(e) => setResidentHead((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Household Members */}
      <div className="space-y-4">
        <h3 className="font-semibold">Household Members</h3>
        <ScrollArea className="h-64 rounded-md border p-4">
          {residentHousehold.map((m, i) => (
            <div key={i} className="flex flex-col mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">#{i + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={m.name}
                    onChange={(e) => updateMember(setResidentHousehold, residentHousehold, i, "name", e.target.value)}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={m.dob}
                    onChange={(e) => {
                      const val = e.target.value;
                      // allow guided typing (partial) here, final validation on save
                      if (/^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(val)) {
                        updateMember(setResidentHousehold, residentHousehold, i, "dob", val);
                      }
                    }}
                  />
                </div>

                {/* Sex/Gender */}
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
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    placeholder="e.g. Spouse, Child"
                    value={m.relationship}
                    onChange={(e) => updateMember(setResidentHousehold, residentHousehold, i, "relationship", e.target.value)}
                  />
                </div>

                {/* Status: Student / Employed / Not a student (Other) */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={m.status || ""}
                    onValueChange={(val) => updateMember(setResidentHousehold, residentHousehold, i, "status", val as MemberStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Not a student (Other)">Not a student (Other)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional: School (shown only when Student) */}
                {m.status === "Student" && (
                  <div className="space-y-2">
                    <Label>School Attending</Label>
                    <Input
                      placeholder="School"
                      value={m.school || ""}
                      onChange={(e) => updateMember(setResidentHousehold, residentHousehold, i, "school", e.target.value)}
                    />
                  </div>
                )}

                {/* Conditional: Occupation (shown when Employed or Not a student (Other)) */}
                {(m.status === "Employed" || m.status === "Not a student (Other)") && (
                  <div className="space-y-2">
                    <Label>Occupation/Work</Label>
                    <Input
                      placeholder="Occupation / Source of Income"
                      value={m.occupation || ""}
                      onChange={(e) => updateMember(setResidentHousehold, residentHousehold, i, "occupation", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        <Button onClick={() => addHouseholdMember(setResidentHousehold, residentHousehold)}>➕ Add Member</Button>
      </div>
    </>
  );
}
