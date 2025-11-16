// app/residentinformation/Profiling.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ResidentForm, { HouseholdMember } from "./ResidentForm";
import LandlordForm from "./LandlordForm";

type PurokData = {
  name: string;
  residents: number;
  tenants: number;
  total: number;
};

export default function Profiling() {
  const [type, setType] = useState<"resident" | "landlord">("resident");

  // Resident state
  const [residentHead, setResidentHead] = useState<Record<string, string>>({});
  const [residentHousehold, setResidentHousehold] = useState<HouseholdMember[]>([
    { name: "", dob: "", gender: "", relationship: "", occupation: "", school: "" },
  ]);

  // Landlord state
  const [landlordInfo, setLandlordInfo] = useState<Record<string, string>>({});
  const [propertyDetails, setPropertyDetails] = useState<Record<string, string>>({});
  const [tenantInfo, setTenantInfo] = useState<Record<string, string>>({});
  const [householdMembersLandlord, setHouseholdMembersLandlord] = useState<HouseholdMember[]>([
    { name: "", dob: "", gender: "", relationship: "", occupation: "", school: "" },
  ]);

  // QR + purok
  const [qrValue, setQrValue] = useState<string>("");
  const [availablePuroks, setAvailablePuroks] = useState<string[]>([]);
  const [purokInput, setPurokInput] = useState<string>("");
  const [addingPurok, setAddingPurok] = useState<boolean>(false);

  // fetch puroks list
  useEffect(() => {
    async function fetchPuroks() {
      try {
        const snapshot = await getDocs(collection(db, "residents"));
        const setMap: Record<string, boolean> = {};
        snapshot.forEach((doc) => {
          const d = doc.data();
          const name = d?.purok || "Unknown";
          setMap[name] = true;
        });
        setAvailablePuroks(Object.keys(setMap));
      } catch (err) {
        console.error("fetch puroks error", err);
      }
    }
    fetchPuroks();
  }, []);

  const handleAddNewPurok = (value: string) => {
    if (value && !availablePuroks.includes(value)) {
      setAvailablePuroks((prev) => [...prev, value]);
      setPurokInput(value);
    }
    setAddingPurok(false);
  };

  const addHouseholdMember = (
    setter: React.Dispatch<React.SetStateAction<HouseholdMember[]>>,
    list: HouseholdMember[]
  ) => {
    setter((prev) => [...prev, { name: "", dob: "", gender: "", relationship: "", occupation: "", school: "" }]);
  };

  // safer updateMember using immutable pattern
  const updateMember = (
    setter: React.Dispatch<React.SetStateAction<HouseholdMember[]>>,
    list: HouseholdMember[],
    i: number,
    field: keyof HouseholdMember,
    value: string
  ) => {
    setter((prev) => {
      if (i < 0 || i >= prev.length) return prev;
      const copy = prev.map((it) => ({ ...it }));
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d+$/.test(phone);
  const validateDOB = (dob: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(dob); // DD/MM/YYYY

  const saveForm = async () => {
    if (!purokInput) return alert("Please select a Purok.");

    const idValue = `${type}-${Date.now()}`;
    setQrValue(idValue);

    // Basic validations
    if (type === "resident") {
      if (!residentHead["Full Legal Name"] || !residentHead["Mobile Number"] || !residentHead["Email Address"] || !residentHead["Sex/Gender"] || !residentHead["Date of Birth"]) {
        return alert("Please fill all required fields for the head of household.");
      }
      if (!validateEmail(residentHead["Email Address"])) return alert("Invalid email format.");
      if (!validatePhone(residentHead["Mobile Number"])) return alert("Contact number must be numeric.");
      if (!["Male","Female"].includes(residentHead["Sex/Gender"])) return alert("Gender must be Male or Female.");
      if (!validateDOB(residentHead["Date of Birth"])) return alert("Date of Birth must be DD/MM/YYYY.");

      for (const m of residentHousehold) {
        if (!m.name || !m.gender || !m.dob) return alert("Each household member must have name, gender and DOB.");
        if (!validateDOB(m.dob)) return alert("Household member DOB must be DD/MM/YYYY.");
        if (!["Male","Female"].includes(m.gender)) return alert("Household member gender must be Male or Female.");
      }
    } else {
      if (!landlordInfo["Full Legal Name"] || !landlordInfo["Mobile Number"] || !landlordInfo["Email Address"]) {
        return alert("Please fill all required fields for the landlord.");
      }
      if (!validateEmail(landlordInfo["Email Address"])) return alert("Invalid email format.");
      if (!validatePhone(landlordInfo["Mobile Number"])) return alert("Contact number must be numeric.");
      // landlord household members:
      for (const m of householdMembersLandlord) {
        if (!m.name || !m.gender || !m.dob) return alert("Each household member must have name, gender and DOB.");
        if (!validateDOB(m.dob)) return alert("Household member DOB must be DD/MM/YYYY.");
        if (!["Male","Female"].includes(m.gender)) return alert("Household member gender must be Male or Female.");
      }
    }

    // Build payload
    let payload: any = {
      ownerType: type,
      purok: purokInput,
      qrCode: idValue,
      createdAt: serverTimestamp(),
    };

    if (type === "resident") {
      payload = { ...payload, headOfHousehold: residentHead, householdMembers: residentHousehold };
    } else {
      payload = { ...payload, landlordInfo, propertyDetails, tenantInfo, householdMembers: householdMembersLandlord };
      payload.isOwnerLivingHere = landlordInfo["Lives in this property"] === "Yes";
    }

    try {
      await addDoc(collection(db, "residents"), payload);
      alert("Saved.");
      // reset
      setPurokInput("");
      setResidentHead({});
      setResidentHousehold([{ name: "", dob: "", gender: "", relationship: "", occupation: "", school: "" }]);
      setLandlordInfo({});
      setPropertyDetails({});
      setTenantInfo({});
      setHouseholdMembersLandlord([{ name: "", dob: "", gender: "", relationship: "", occupation: "", school: "" }]);
      setQrValue("");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{type === "resident" ? "Old Resident Registration" : "Landlady/Landlord Registration"}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle */}
        <div className="flex gap-4">
          <Button variant={type === "resident" ? "default" : "outline"} onClick={() => setType("resident")}>Old Resident</Button>
          <Button variant={type === "landlord" ? "default" : "outline"} onClick={() => setType("landlord")}>Landlady/Landlord</Button>
        </div>

        {/* Purok select */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Purok</label>
          <Select value={purokInput} onValueChange={setPurokInput}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Purok" /></SelectTrigger>
            <SelectContent>
              {availablePuroks.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          {addingPurok ? (
            <div className="flex gap-2 mt-2">
              <input value={purokInput} onChange={(e) => setPurokInput(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="New Purok" />
              <Button onClick={() => handleAddNewPurok(purokInput)}>✔</Button>
              <Button variant="outline" onClick={() => setAddingPurok(false)}>✖</Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setAddingPurok(true)}>➕ Add Purok</Button>
          )}
        </div>

        {type === "resident" ? (
          <ResidentForm
            residentHead={residentHead}
            setResidentHead={setResidentHead}
            residentHousehold={residentHousehold}
            setResidentHousehold={setResidentHousehold}
            addHouseholdMember={addHouseholdMember}
            updateMember={updateMember}
          />
        ) : (
          <LandlordForm
            landlordInfo={landlordInfo}
            setLandlordInfo={setLandlordInfo}
            propertyDetails={propertyDetails}
            setPropertyDetails={setPropertyDetails}
            tenantInfo={tenantInfo}
            setTenantInfo={setTenantInfo}
            householdMembers={householdMembersLandlord}
            setHouseholdMembers={setHouseholdMembersLandlord}
            addHouseholdMember={addHouseholdMember}
            updateMember={updateMember}
          />
        )}

        <Button className="w-full" onClick={saveForm}>💾 Save Form</Button>

        {qrValue && (
          <div className="mt-4 p-4 bg-white rounded shadow">
            <label className="block text-sm font-medium text-gray-700">Family QR Code</label>
            <QRCode value={qrValue} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
