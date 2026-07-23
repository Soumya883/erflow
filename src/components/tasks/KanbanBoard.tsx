"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateTaskStatus } from '@/app/actions/work';
import { toast } from 'sonner';
import { Calendar, User, AlignLeft, AlertCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  { id: 'REVIEW', title: 'Review', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  { id: 'DONE', title: 'Done', color: 'bg-green-500/10 text-green-700 border-green-200' },
];

function SortableTask({ task, isDraggingOverlay = false }: { task: any, isDraggingOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColor = 
    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
    'bg-gray-100 text-gray-700';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isDraggingOverlay ? 'shadow-xl scale-105 rotate-2 border-primary ring-2 ring-primary/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">{task.title}</h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityColor}`}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <div className="flex items-start gap-1 text-xs text-muted-foreground line-clamp-2">
          <AlignLeft className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p>{task.description}</p>
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5" title={task.assignee?.user?.name || "Unassigned"}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium text-[10px]">
            {task.assignee?.user?.name ? task.assignee.user.name.substring(0, 2).toUpperCase() : <User className="h-3 w-3" />}
          </div>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 font-medium">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialTasks, userRole, userId }: { initialTasks: any[], userRole: string, userId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  // Sync tasks if initialTasks changes from server
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          // Task moved to a different column
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].status = overId as string;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    const newStatus = over.data.current?.type === 'Column' 
      ? overId 
      : tasks.find(t => t.id === overId)?.status;

    if (newStatus && activeTask.status !== newStatus) {
      // Permission check locally before firing request to avoid flicker if denied
      if (userRole === "EMPLOYEE") {
        if (activeTask.assignee?.userId !== userId) {
          toast.error("You can only move your own tasks.");
          setTasks(initialTasks); // Revert
          return;
        }
      }

      // Optimistic update was done in dragOver, now persist to DB
      try {
        await updateTaskStatus(activeId as string, newStatus as any);
      } catch (err: any) {
        toast.error(err.message || "Failed to update task status");
        setTasks(initialTasks); // Revert on failure
      }
    }
  };

  // Helper component for columns
  const Column = ({ id, title, color, tasksInColumn }: any) => {
    const { setNodeRef } = useSortable({
      id: id,
      data: { type: 'Column' }
    });

    return (
      <div className="flex flex-col flex-1 min-w-[280px] max-w-[350px] bg-secondary/30 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${color}`}>
              {title}
            </span>
            <span className="flex items-center justify-center bg-background text-muted-foreground text-xs font-semibold h-5 w-5 rounded-full border border-border">
              {tasksInColumn.length}
            </span>
          </div>
        </div>
        
        <div 
          ref={setNodeRef}
          className="flex flex-col gap-3 min-h-[500px] rounded-xl transition-colors"
        >
          <SortableContext items={tasksInColumn.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
            {tasksInColumn.map((task: any) => (
              <SortableTask key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(col => (
          <Column 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            color={col.color} 
            tasksInColumn={tasks.filter(t => t.status === col.id)} 
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <SortableTask task={activeTask} isDraggingOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
