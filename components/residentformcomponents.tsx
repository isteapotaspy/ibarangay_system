import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-2">
    <h2 className="text-lg font-semibold text-blue-700">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

export const InputField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (newVal: string) => void;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <Input value={value} placeholder={label} onChange={(e) => onChange(e.target.value)} />
  </div>
);
