"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// Removed @prisma/client import to prevent browser bundle failure
enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE"
}
import { getTasksAction, updateTaskStatusAction } from "@/app/actions/task";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sortable Item Component ---
function SortableTaskItem({ task }: { task: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
            <Badge variant="outline" className="ml-2 shrink-0 text-[10px] uppercase">
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center mt-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground border border-background">
              {task.assignee?.name?.charAt(0) || "U"}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {task.assignee?.name || "Unassigned"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Kanban Board ---
export function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: TaskStatus.TODO, title: "To Do" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { id: TaskStatus.REVIEW, title: "In Review" },
    { id: TaskStatus.DONE, title: "Done" },
  ];

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await getTasksAction({});
        if (res?.data) {
          setTasks(res.data);
        }
      } catch (e) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === taskId);
    if (!activeTask) return;

    // Check if dropping on a column directly
    const isOverColumn = columns.find((col) => col.id === overId);
    let newStatus = activeTask.status;

    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      // Dropping on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (activeTask.status !== newStatus) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      try {
        const res = await updateTaskStatusAction({ taskId, newStatus });
        if (res?.error) {
          toast.error(res.error);
          // Revert on error
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: activeTask.status } : t))
          );
        } else {
          toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
        }
      } catch (err) {
        toast.error("Failed to update task status");
      }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="bg-muted/30 p-4 rounded-xl border">
            <h3 className="font-semibold mb-4 text-sm">{col.title}</h3>
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="bg-muted/40 p-3 rounded-xl border flex flex-col h-[70vh]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-sm text-foreground/80">{col.title}</h3>
                <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <SortableContext
                  id={col.id}
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px]" /* Droppable area even if empty */>
                    {colTasks.map((task) => (
                      <SortableTaskItem key={task.id} task={JSON.parse(JSON.stringify(task))} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
