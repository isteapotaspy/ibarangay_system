"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default function ResidentInformationPage() {
  const [type, setType] = useState<"resident" | "landlord">("resident");
  const [purok, setPurok] = useState("");
  const [householdMembers, setHouseholdMembers] = useState<
    { name: string; dob: string; relationship: string; occupation?: string }[]
  >([{ name: "", dob: "", relationship: "", occupation: "" }]);

  const addHouseholdMember = () =>
    setHouseholdMembers([
      ...householdMembers,
      { name: "", dob: "", relationship: "", occupation: "" },
    ]);

  const updateMember = (i: number, field: string, value: string) => {
    const updated = [...householdMembers];
    updated[i] = { ...updated[i], [field]: value };
    setHouseholdMembers(updated);
  };

  const saveForm = async () => {
    const payload = {
      purok,
      ownerType: type,
      householdMembers,
      // createdAt: serverTimestamp()
    };

    console.log("Form data ready for Firebase: ", payload);
    alert("🔐 Form submission captured in console (Firebase-ready).");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-5">
        <h1 className="text-xl font-bold">🏘 iBarangay</h1>
        <nav className="space-y-3 text-sm">
          <div className="hover:text-yellow-400 cursor-pointer">
            🏠 Dashboard
          </div>
          <div className="hover:text-yellow-400 cursor-pointer">
            📊 Statistics
          </div>
          <div className="hover:text-yellow-400 cursor-pointer">
            📁 Records
          </div>
          <div className="hover:text-yellow-400 cursor-pointer">
            ⚙ Settings
          </div>
        </nav>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 p-8">
        {/* TOP NAV */}
        <div className="w-full bg-white shadow p-4 rounded-lg mb-8 flex justify-between">
          <span className="font-bold text-lg">
            {type === "resident"
              ? "Resident Registration"
              : "Landlord Registration"}
          </span>
          <span className="text-gray-500">👤 Admin</span>
        </div>

        {/* REGISTRATION FORM */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">
              {type === "resident"
                ? "Old Resident Form"
                : "Landlord / Tenant Form"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* TOGGLE BUTTON */}
            <div className="flex gap-4">
              <Button
                variant={type === "resident" ? "default" : "outline"}
                onClick={() => setType("resident")}
              >
                Old Resident
              </Button>
              <Button
                variant={type === "landlord" ? "default" : "outline"}
                onClick={() => setType("landlord")}
              >
                Landlady/Landlord
              </Button>
            </div>

            {/* COMMON: Purok */}
            <div className="space-y-2">
              <Label>Purok</Label>
              <Input
                placeholder="Purok Number"
                value={purok}
                onChange={(e) => setPurok(e.target.value)}
              />
            </div>

            {type === "resident" ? (
              <>
                {/* HEAD OF HOUSEHOLD */}
                <Section title="Head of Household Details">
                  {renderInput("Full Legal Name")}
                  {renderInput("Date of Birth", "date")}
                  {renderInput("Place of Birth")}
                  {renderInput("Sex/Gender")}
                  {renderInput("Civil Status")}
                  {renderInput("Nationality")}
                  {renderInput("Current Address")}
                  {renderInput("Mobile Number")}
                  {renderInput("Alternate Contact Number")}
                  {renderInput("Email Address")}
                  {renderInput("Occupation/Income Source")}
                  {renderInput("Date of Residency", "date")}
                  {renderInput("Home Ownership Proof")}
                  {renderInput("Voter Status (Yes/No)")}
                  {renderInput("Educational Attainment")}
                  {renderInput("Emergency Contact Person")}
                </Section>
              </>
            ) : (
              <>
                {/* LANDLORD INFORMATION */}
                <Section title="Landlord Information">
                  {renderInput("Full Legal Name")}
                  {renderInput("Current Address")}
                  {renderInput("Mobile Number")}
                  {renderInput("Alternate Contact Number")}
                  {renderInput("Email Address")}
                  {renderInput("Proof of Ownership (Tax Decl. No.)")}
                  {renderInput("Emergency Contact Person")}
                  {renderInput("Date Registered in Barangay", "date")}
                </Section>

                {/* PROPERTY DETAILS */}
                <Section title="Property Details">
                  {renderInput("Rental Property Address")}
                  {renderInput("Type of Property (Apartment/Room/etc)")}
                  {renderInput("Number of Rental Units")}
                  {renderInput("Land Title or Tax Declaration No.")}
                </Section>

                {/* TENANT DETAILS */}
                <Section title="Head Tenant Details">
                  {renderInput("Full Legal Name")}
                  {renderInput("Date of Birth", "date")}
                  {renderInput("Place of Birth")}
                  {renderInput("Sex/Gender")}
                  {renderInput("Civil Status")}
                  {renderInput("Nationality")}
                  {renderInput("Previous Address")}
                  {renderInput("Mobile Number")}
                  {renderInput("Occupation")}
                  {renderInput("Voter Status")}
                </Section>
              </>
            )}

            {/* HOUSEHOLD MEMBERS */}
            <Section title="Household Members">
              <ScrollArea className="h-64 rounded-md border p-4">
                {householdMembers.map((m, i) => (
                  <div key={i} className="flex flex-col mb-4 space-y-2">
                    <div className="flex gap-3 justify-between">
                      <span className="w-24 font-semibold">#{i + 1}</span>
                    </div>
                    {renderInput(
                      "Full Name",
                      "text",
                      (val) => updateMember(i, "name", val)
                    )}
                    {renderInput(
                      "Date of Birth",
                      "date",
                      (val) => updateMember(i, "dob", val)
                    )}
                    {renderInput(
                      "Relationship",
                      "text",
                      (val) => updateMember(i, "relationship", val)
                    )}
                    {renderInput(
                      "Occupation",
                      "text",
                      (val) => updateMember(i, "occupation", val)
                    )}
                  </div>
                ))}
              </ScrollArea>
              <Button variant="secondary" onClick={addHouseholdMember}>
                ➕ Add Member
              </Button>
            </Section>

            {/* SAVE FORM */}
            <Button className="w-full" onClick={saveForm}>
              💾 Save Form
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function renderInput(
  label: string,
  type: string = "text",
  onChange?: (value: string) => void
) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={label}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
