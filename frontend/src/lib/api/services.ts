import { api } from "./client";
import type { Task, Project, Resource, ClassSession } from "@/lib/mock-data";

// Normalize backend ids (which may come as numbers) into strings.
const asStringId = <T extends { id: unknown }>(o: T): T & { id: string } => ({
  ...o,
  id: String(o.id),
});

// ---------- Tasks ----------
export const TasksApi = {
  list: () => api<Task[]>("/tasks").then((rows) => rows.map(asStringId)),
  create: (input: Omit<Task, "id">) =>
    api<Task>("/tasks", { method: "POST", body: input }).then(asStringId),
  update: (id: string, patch: Partial<Task>) =>
    api<Task>(`/tasks/${id}`, { method: "PUT", body: patch }).then(asStringId),
  remove: (id: string) => api<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ---------- Projects ----------
export const ProjectsApi = {
  list: () => api<Project[]>("/projects").then((rows) => rows.map(asStringId)),
  create: (input: Omit<Project, "id">) =>
    api<Project>("/projects", { method: "POST", body: input }).then(asStringId),
  update: (id: string, patch: Partial<Project>) =>
    api<Project>(`/projects/${id}`, { method: "PUT", body: patch }).then(asStringId),
  remove: (id: string) => api<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ---------- Resources ----------
export const ResourcesApi = {
  list: () => api<Resource[]>("/resources").then((rows) => rows.map(asStringId)),
  create: (input: Omit<Resource, "id">) =>
    api<Resource>("/resources", { method: "POST", body: input }).then(asStringId),
  remove: (id: string) => api<void>(`/resources/${id}`, { method: "DELETE" }),
};

// ---------- Schedule ----------
export const ScheduleApi = {
  list: () => api<ClassSession[]>("/schedule").then((rows) => rows.map(asStringId)),
  create: (input: Omit<ClassSession, "id">) =>
    api<ClassSession>("/schedule", { method: "POST", body: input }).then(asStringId),
  remove: (id: string) => api<void>(`/schedule/${id}`, { method: "DELETE" }),
};
