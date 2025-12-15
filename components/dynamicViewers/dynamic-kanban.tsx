'use client';

import { useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { useTheme } from "@/context/ThemeContext";

interface KanbanQueueProps {
  data: any[];
  onCardClick?: (card: any) => void;
  onCardUpdate?: (card: any) => void;
}

// Theme-aware column colors
const columnColorsLight: Record<string, string> = {
  Resolved: "bg-green-50",
  Processing: "bg-yellow-50",
  Pending: "bg-blue-50",
};
const columnColorsDark: Record<string, string> = {
  Resolved: "bg-green-600",
  Processing: "bg-yellow-600",
  Pending: "bg-blue-600",
};

const groupByStatus = (data: any[]) => {
  const columns: Record<string, any[]> = {};
  data.forEach(item => {
    if (!columns[item.status]) columns[item.status] = [];
    columns[item.status].push(item);
  });

  Object.keys(columns).forEach(status => {
    columns[status].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  });

  return columns;
};

export default function DynamicKanban({ data, onCardClick, onCardUpdate }: KanbanQueueProps) {
  const { theme } = useTheme();
  const [columns, setColumns] = useState(groupByStatus(data));

  useMemo(() => setColumns(groupByStatus(data)), [data]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = Array.from(columns[source.droppableId]);
    const destCol = Array.from(columns[destination.droppableId]);
    const movedCard = sourceCol[source.index];
    movedCard.status = destination.droppableId;

    sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, movedCard);

    setColumns(prev => ({
      ...prev,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    }));

    if (onCardUpdate) onCardUpdate(movedCard);
  };

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">No kanban items available 😮</div>;
  }

  const columnColors = theme === "dark" ? columnColorsDark : columnColorsLight;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {Object.keys(columns).map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex flex-col rounded-lg p-2 min-w-[250px] flex-shrink-0 ${columnColors[status]}`}
              >
                <h3 className="font-semibold mb-2 pl-2">{status}</h3>

                {columns[status].map((card, index) => (
                  <Draggable draggableId={card.id} index={index} key={card.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`rounded-lg p-4 mb-2 shadow cursor-pointer transition-transform 
                          ${snapshot.isDragging ? "scale-105 shadow-lg" : ""} 
                          ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"}`}
                        onClick={() => onCardClick?.(card)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{card.type}</span>
                          <span className="text-sm font-medium text-gray-500">Priority {card.priority}</span>
                        </div>
                        <div className="text-sm mb-1">ID: {card.id}</div>
                        <div className="text-sm mb-1">Assigned: {card.assignedTo}</div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
