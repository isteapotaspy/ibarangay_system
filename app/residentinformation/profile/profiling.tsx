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

export default function Profiling() {
  const [type, setType] = useState<"resident" | "landlord">("resident");

  const [residentHead, setResidentHead] = useState<Record<string, string>>({});
  const [residentHousehold, setResidentHousehold] = useState<HouseholdMember[]>([
    { name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" },
  ]);

  const [landlordInfo, setLandlordInfo] = useState<Record<string, string>>({});
  const [propertyDetails, setPropertyDetails] = useState<Record<string, string>>({});
  const [tenantInfo, setTenantInfo] = useState<Record<string, string>>({});
  const [householdMembersLandlord, setHouseholdMembersLandlord] = useState<HouseholdMember[]>([
    { name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" },
  ]);

  const [qrValue, setQrValue] = useState<string>("");
  const [availablePuroks, setAvailablePuroks] = useState<string[]>([]);
  const [purokInput, setPurokInput] = useState<string>("");
  const [addingPurok, setAddingPurok] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPuroks() {
      const snapshot = await getDocs(collection(db, "residents"));
      const setNames: Record<string, boolean> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        const name = data.purok || "Unknown";
        setNames[name] = true;
      });
      setAvailablePuroks(Object.keys(setNames));
    }
    fetchPuroks();
  }, []);

  const handleAddNewPurok = (value: string) => {
    if (!value) return;
    if (!availablePuroks.includes(value)) setAvailablePuroks((s) => [...s, value]);
    setPurokInput(value);
    setAddingPurok(false);
  };

  const addHouseholdMember = (
    setter: React.Dispatch<React.SetStateAction<HouseholdMember[]>>,
    list: HouseholdMember[]
  ) => {
    setter([...list, { name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" }]);
  };

  const updateMember = (
    setter: React.Dispatch<React.SetStateAction<HouseholdMember[]>>,
    list: HouseholdMember[],
    i: number,
    field: keyof HouseholdMember,
    value: string
  ) => {
    setter((prev) => {
      const copy = [...prev];
      const defaults: HouseholdMember = { name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" };
      const member = copy[i] ? { ...copy[i] } : { ...defaults };
      member[field] = value;
      copy[i] = member;
      return copy;
    });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone === "" || /^\d+$/.test(phone);
  const validateDOB = (dob: string) => /^\d{4}-\d{2}-\d{2}$/.test(dob);

  const saveForm = async () => {
    const idValue = `${type}-${Date.now()}`;
    setQrValue(idValue);

    if (!purokInput) return alert("Please select a Purok.");

    if (type === "resident") {
      if (!residentHead["Full Legal Name"]) return alert("Please fill Full Legal Name for head.");
      if (!residentHead["Date of Birth"] || !validateDOB(residentHead["Date of Birth"])) return alert("Head Date of Birth required (YYYY-MM-DD).");
      if (!residentHead["Sex/Gender"] || !["Male", "Female"].includes(residentHead["Sex/Gender"])) return alert("Head Sex/Gender required.");
      if (residentHead["Email Address"] && !validateEmail(residentHead["Email Address"])) return alert("Head email is invalid.");
      if (residentHead["Mobile Number"] && !validatePhone(residentHead["Mobile Number"])) return alert("Head mobile must be numbers only.");

      for (const m of residentHousehold) {
        if (!m.name) return alert("Each household member must have a name.");
        if (!m.dob || !validateDOB(m.dob)) return alert("Each member DOB must be YYYY-MM-DD.");
        if (!m.gender || !["Male", "Female"].includes(m.gender)) return alert("Each member Sex/Gender must be Male or Female.");
      }
    } else {
      if (!landlordInfo["Full Legal Name"]) return alert("Please fill Full Legal Name for landlord.");
      if (!landlordInfo["Date of Birth"] || !validateDOB(landlordInfo["Date of Birth"])) return alert("Landlord DOB required (YYYY-MM-DD).");
      if (!landlordInfo["Lives in this property"]) return alert("Please indicate if the landlord lives in this property.");
      if (landlordInfo["Email Address"] && !validateEmail(landlordInfo["Email Address"])) return alert("Landlord email is invalid.");
      if (landlordInfo["Mobile Number"] && !validatePhone(landlordInfo["Mobile Number"])) return alert("Landlord mobile must be numbers only.");

      for (const m of householdMembersLandlord) {
        if (!m.name) return alert("Each household member must have a name.");
        if (!m.dob || !validateDOB(m.dob)) return alert("Each member DOB must be YYYY-MM-DD.");
        if (!m.gender || !["Male", "Female"].includes(m.gender)) return alert("Each member Sex/Gender must be Male or Female.");
      }
    }

    const payloadBase: any = {
      ownerType: type,
      purok: purokInput,
      qrCode: idValue,
      createdAt: serverTimestamp(),
    };

    let payload = payloadBase;
    if (type === "resident") {
      payload = {
        ...payloadBase,
        headOfHousehold: residentHead,
        householdMembers: residentHousehold,
        counts: {
          head: 1,
          household: residentHousehold.length,
          totalPersons: 1 + residentHousehold.length,
        },
      };
    } else {
      payload = {
        ...payloadBase,
        landlordInfo,
        propertyDetails,
        tenantInfo,
        householdMembers: householdMembersLandlord,
        counts: {
          landlord: 1,
          household: householdMembersLandlord.length,
          totalPersons: 1 + householdMembersLandlord.length,
        },
        ownerLivesInProperty: landlordInfo["Lives in this property"] === "Yes",
      };
    }

    try {
      await addDoc(collection(db, "residents"), payload);
      alert("Saved successfully!");

      setPurokInput("");
      setResidentHead({});
      setResidentHousehold([{ name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" }]);
      setLandlordInfo({});
      setPropertyDetails({});
      setTenantInfo({});
      setHouseholdMembersLandlord([{ name: "", dob: "", gender: "", relationship: "", occupation: "", status: "Not student", school: "" }]);
      setQrValue("");
    } catch (err) {
      console.error(err);
      alert("Failed to save. See console.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{type === "resident" ? "Old Resident Registration" : "Landlady/Landlord Registration"}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button variant={type === "resident" ? "default" : "outline"} onClick={() => setType("resident")}>
            Old Resident
          </Button>
          <Button variant={type === "landlord" ? "default" : "outline"} onClick={() => setType("landlord")}>
            Landlady/Landlord
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Purok</label>
          <Select onValueChange={setPurokInput} value={purokInput}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Purok" />
            </SelectTrigger>
            <SelectContent>
              {availablePuroks.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {addingPurok ? (
            <div className="flex gap-2 mt-2">
              <input
                value={purokInput}
                onChange={(e) => setPurokInput(e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                placeholder="New Purok"
              />
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
