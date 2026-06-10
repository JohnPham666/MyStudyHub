// Shared domain types, enums, and color tokens.
// (Mock store removed — data now lives in the backend via src/lib/data.ts hooks.)

export type Priority = "Low" | "Medium" | "High";
export type Status = "Todo" | "In Progress" | "Done";
export type Category =
  | "Study"
  | "Assignment"
  | "Group Project"
  | "English Teaching"
  | "Personal";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline: string; // ISO
  status: Status;
  category: Category;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  members: string[];
}

export interface Resource {
  id: string;
  subject: string;
  fileLink: string;
  note: string;
  tags: string[];
}

export interface ClassSession {
  id: string;
  studentName: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  note?: string;
}

export const CATEGORIES: Category[] = [
  "Study",
  "Assignment",
  "Group Project",
  "English Teaching",
  "Personal",
];
export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];
export const STATUSES: Status[] = ["Todo", "In Progress", "Done"];

export const categoryColor = (c: Category) =>
  ({
    Study: "var(--cat-study)",
    Assignment: "var(--cat-assignment)",
    "Group Project": "var(--cat-group)",
    "English Teaching": "var(--cat-english)",
    Personal: "var(--cat-personal)",
  })[c];

export const priorityColor = (p: Priority) =>
  ({ High: "var(--priority-high)", Medium: "var(--priority-med)", Low: "var(--priority-low)" })[p];
