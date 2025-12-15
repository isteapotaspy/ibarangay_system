'use client';

import { useTheme } from "@/context/ThemeContext";
import { JSX } from "react";
import React from "react";

type UniversalRecord = Record<string, any>;

type DynamicCardListProps<T extends Record<string, any>> = {
  data: T[];
  onCardClick?: (item: T) => void;
  titleField?: string;
  statusField?: string;
  labelMap?: Record<string, string>;
  hiddenFields?: string[];
  renderField?: (value: any, key: string, item: T) => JSX.Element | string | null;
};

export default function DynamicCardList<T extends UniversalRecord>({
  data,
  onCardClick,
  titleField,
  statusField,
  labelMap = {},
  hiddenFields = [],
  renderField,
}: DynamicCardListProps<T>) {
  const { theme } = useTheme();

  const badgeColors = (status: string) => {
    if (theme === "dark") {
      if (status === "Pending") return "bg-orange-700 text-orange-200";
      if (status === "Investigating") return "bg-yellow-700 text-yellow-200";
      if (status === "Resolved") return "bg-green-700 text-green-200";
      return "bg-gray-700 text-gray-200";
    } else {
      if (status === "Pending") return "bg-orange-100 text-orange-700";
      if (status === "Investigating") return "bg-yellow-100 text-yellow-700";
      if (status === "Resolved") return "bg-green-100 text-green-700";
      return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={`space-y-4 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
      {data.map((item, index) => (
        <div
          key={item.id || index}
          className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer
            ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          onClick={() => onCardClick?.(item)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-lg">
                  {titleField ? item[titleField] : `Record ${index + 1}`}
                </h4>
                {statusField && item[statusField] && (
                  <span className={`px-2 py-1 rounded text-xs ${badgeColors(item[statusField])}`}>
                    {item[statusField]}
                  </span>
                )}
              </div>
              {item.dateReported && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.id} • {item.dateReported} {item.timeReported ? `at ${item.timeReported}` : ""}
                </p>
              )}
            </div>
          </div>

          {item.description && <p className="text-sm mb-4">{item.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {!hiddenFields.includes("location") && item.location && (
              <div>
                <p className="text-gray-400 dark:text-gray-500">Location</p>
                <p>{item.location}</p>
              </div>
            )}
            {!hiddenFields.includes("purok") && item.purok && (
              <div>
                <p className="text-gray-400 dark:text-gray-500">Purok / Zone</p>
                <p>{item.purok}</p>
              </div>
            )}
            {!hiddenFields.includes("reportedBy") && item.reportedBy && (
              <div>
                <p className="text-gray-400 dark:text-gray-500">Reported By</p>
                <p>{item.reportedBy}</p>
              </div>
            )}
            {!hiddenFields.includes("assignedOfficer") && item.assignedOfficer && (
              <div>
                <p className="text-gray-400 dark:text-gray-500">Assigned Officer</p>
                <p>{item.assignedOfficer}</p>
              </div>
            )}
          </div>

          {item.notes && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Notes: {item.notes}</p>
            </div>
          )}
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          <p>No items found</p>
        </div>
      )}
    </div>
  );
}
