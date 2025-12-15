'use client';

import { useTheme } from "@/context/ThemeContext";

interface DynamicQueueProps {
  data: any[];
  caption?: string;
  renderCard: (row: any) => React.ReactNode;
}

export default function DynamicQueue({ data, caption, renderCard }: DynamicQueueProps) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">No queue items available 😮</div>;
  }

  return (
    <div className={`space-y-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
      {caption && <h2 className="text-lg font-bold mb-2">{caption}</h2>}
      {data.map((row) => (
        <div key={row.id}>
          {renderCard(row)}
        </div>
      ))}
    </div>
  );
}
