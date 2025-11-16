"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

type Purok = {
  name: string;
  residents: number;
  tenants: number;
  total: number;
};

export default function SeePuroksView() {
  const [puroks, setPuroks] = useState<Purok[]>([]);
  const [totalPopulation, setTotalPopulation] = useState(0);

  const PUROK_COLORS = ["#4f46e5", "#2563eb", "#f97316", "#16a34a", "#db2777", "#facc15"];
  const RES_TEN_COLORS = ["#2563eb", "#f97316"]; // Residents = blue, Tenants = orange

  useEffect(() => {
    async function fetchPuroks() {
      const snapshot = await getDocs(collection(db, "residents"));
      const map: Record<string, { residents: number; tenants: number }> = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const purokName = data.purok || "Unknown";

        if (!map[purokName]) map[purokName] = { residents: 0, tenants: 0 };

        const householdCount = data.householdMembers?.length || 0;

        if (data.ownerType === "resident") {
          // Resident head + household members
          map[purokName].residents += 1 + householdCount;
        } else if (data.ownerType === "landlord") {
          // Owner may live elsewhere but still a resident
          const ownerIsResident = data.isOwnerResident || false; // owner lives elsewhere but still a resident
          const ownerLivesHere = data.isOwnerLivingHere || false; // owner lives in this property

          if (ownerIsResident) {
            map[purokName].residents += 1; // owner counts as resident
          }

          if (ownerLivesHere) {
            map[purokName].tenants += 1 + householdCount; // owner + household counted as tenants
          } else {
            map[purokName].tenants += householdCount; // only tenants counted
          }
        }
      });

      const list: Purok[] = Object.entries(map).map(([name, counts]) => ({
        name,
        residents: counts.residents,
        tenants: counts.tenants,
        total: counts.residents + counts.tenants,
      }));

      setPuroks(list);
      setTotalPopulation(list.reduce((sum, p) => sum + p.total, 0));
    }

    fetchPuroks();
  }, []);

  const barangayPieData = puroks.map(p => ({ name: p.name, value: p.total }));
  const overallResTenData = [
    { name: "Residents", value: puroks.reduce((sum, p) => sum + p.residents, 0) },
    { name: "Tenants", value: puroks.reduce((sum, p) => sum + p.tenants, 0) },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Small Purok Pie Charts Sidebar */}
      <div className="md:w-1/4 flex flex-col gap-4">
        {puroks.map(p => (
          <div
            key={p.name}
            className="flex items-center gap-2 bg-blue-50 p-2 rounded shadow hover:bg-blue-100"
          >
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Residents", value: p.residents },
                      { name: "Tenants", value: p.tenants },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={30}
                    innerRadius={10}
                  >
                    <Cell fill={RES_TEN_COLORS[0]} />
                    <Cell fill={RES_TEN_COLORS[1]} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-semibold">{p.name}</span>
              <span>Residents: {p.residents}</span>
              <span>Tenants: {p.tenants}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Barangay Population by Purok */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Barangay Population by Purok</CardTitle>
            <p className="text-sm text-gray-600">Total Population: {totalPopulation}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={barangayPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {barangayPieData.map((_, i) => (
                    <Cell key={i} fill={PUROK_COLORS[i % PUROK_COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overall Residents vs Tenants */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Overall Residents vs Tenants</CardTitle>
            <p className="text-sm text-gray-600">Total Population: {totalPopulation}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallResTenData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {RES_TEN_COLORS.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
