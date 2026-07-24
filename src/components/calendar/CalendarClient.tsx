"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare, Clock } from "lucide-react";
import { MarkLeaveModal } from "./MarkLeaveModal";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "TASK" | "LEAVE";
  status?: string;
  user?: string;
};

export function CalendarClient({ 
  events,
  isAdmin = false,
  employees = []
}: { 
  events: CalendarEvent[];
  isAdmin?: boolean;
  employees?: { id: string, name: string }[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDateClick = (day: Date) => {
    if (isAdmin) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goToToday} className="px-4 py-2 font-medium text-sm hover:bg-muted rounded-lg transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-sm py-3 text-muted-foreground uppercase tracking-wider">
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-border mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find events for this day
        const dayEvents = events.filter(e => isSameDay(parseISO(e.date), cloneDay));

        days.push(
          <div 
            key={day.toISOString()} 
            onClick={() => handleDateClick(cloneDay)}
            className={`min-h-[120px] p-2 border border-border/50 bg-card ${isAdmin ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''} ${
              !isSameMonth(day, monthStart)
                ? "text-muted-foreground/50 bg-muted/20"
                : isSameDay(day, new Date())
                ? "bg-primary/5 border-primary/20"
                : ""
            }`}
          >
            <div className={`text-right font-medium text-sm mb-2 ${
              isSameDay(day, new Date()) ? "text-primary font-bold" : ""
            }`}>
              {formattedDate}
            </div>
            
            <div className="space-y-1.5">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className={`px-2 py-1 text-xs rounded-md truncate font-medium flex flex-col gap-0.5 ${
                    event.type === "TASK" 
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {event.type === "TASK" ? <CheckSquare className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{event.title}</span>
                  </div>
                  {event.user && (
                    <span className="text-[10px] opacity-80 pl-4 truncate">{event.user}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      {isAdmin && selectedDate && (
        <MarkLeaveModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          date={selectedDate}
          employees={employees}
        />
      )}
    </div>
  );
}
