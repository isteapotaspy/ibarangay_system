'use client';

import { format } from "date-fns";
import { useTheme } from "@/context/ThemeContext";

interface QueueCardProps {
  card: {
    id: string;
    type: string;
    status: string;
    priority: number;
    assignedTo: string;
    lastServiced?: Date;
    nextServiceDue?: Date;
    scheduledDate?: Date;
    issue?: string;
  };
  onClick?: (card: any) => void;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  InProgress: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function QueueCard({ card, onClick }: QueueCardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`
        rounded-lg p-4 mb-4 shadow cursor-pointer transition-transform transform hover:scale-105
        ${theme === "light" ? "bg-white hover:shadow-lg" : "bg-gray-800 hover:shadow-xl"}
      `}
      onClick={() => onClick && onClick(card)}
    >
      {/* Header: Type & Priority */}
      <div className="flex justify-between items-center mb-2">
        <span className={`${theme === "light" ? "text-gray-800" : "text-gray-100"} font-semibold`}>
          {card.type}
        </span>
        <span className={`${theme === "light" ? "text-gray-500" : "text-gray-300"} text-sm font-medium`}>
          Priority {card.priority}
        </span>
      </div>

      {/* Status Badge */}
      <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${statusColors[card.status] || "bg-gray-200 text-gray-800"}`}>
        {card.status}
      </div>

      {/* Body: ID and Assigned To */}
      <div className={`${theme === "light" ? "text-gray-700" : "text-gray-200"} text-sm mb-1`}>
        ID: {card.id}
      </div>
      <div className={`${theme === "light" ? "text-gray-700" : "text-gray-200"} text-sm mb-1`}>
        Assigned: {card.assignedTo}
      </div>

      {/* Issue (if exists) */}
      {card.issue && (
        <div className="text-sm text-purple-400 dark:text-purple-300 underline mb-1">
          {card.issue}
        </div>
      )}

      {/* Dates */}
      {card.scheduledDate && (
        <div className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-xs`}>
          Scheduled: {format(new Date(card.scheduledDate), "yyyy-MM-dd")}
        </div>
      )}
      {card.lastServiced && (
        <div className={`${theme === "light" ? "text-gray-400" : "text-gray-500"} text-xs`}>
          Last Serviced: {format(new Date(card.lastServiced), "yyyy-MM-dd")}
        </div>
      )}
      {card.nextServiceDue && (
        <div className={`${theme === "light" ? "text-gray-400" : "text-gray-500"} text-xs`}>
          Next Service Due: {format(new Date(card.nextServiceDue), "yyyy-MM-dd")}
        </div>
      )}
    </div>
  );
}
