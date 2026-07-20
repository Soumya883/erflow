"use server";

import { prisma } from "@/lib/prisma";
import { withAdminAction } from "@/lib/safe-action";

export const getAnalyticsDataAction = withAdminAction(async () => {
  const profiles = await prisma.employee.findMany({
    select: { department: true },
  });

  const departmentCounts: Record<string, number> = {};
  let unassignedCount = 0;

  profiles.forEach((profile) => {
    if (profile.department) {
      departmentCounts[profile.department] = (departmentCounts[profile.department] || 0) + 1;
    } else {
      unassignedCount++;
    }
  });

  const employeeDistribution = Object.keys(departmentCounts).map((dept) => ({
    name: dept,
    value: departmentCounts[dept],
  }));

  if (unassignedCount > 0) {
    employeeDistribution.push({ name: "Unassigned", value: unassignedCount });
  }

  // 2. Task Completion Rates by Status
  const tasks = await prisma.task.findMany({
    select: { status: true },
  });

  const statusCounts: Record<string, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  };

  tasks.forEach((task) => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }
  });

  const taskCompletionRates = Object.keys(statusCounts).map((status) => ({
    name: status.replace("_", " "),
    value: statusCounts[status],
  }));

  // 3. Top-Level Stats
  const totalEmployees = profiles.length;
  const totalTasks = tasks.length;
  const completedTasks = statusCounts["DONE"];
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    employeeDistribution,
    taskCompletionRates,
    stats: {
      totalEmployees,
      totalTasks,
      completedTasks,
      completionPercentage,
    },
  };
});
