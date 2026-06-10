// React Query hooks backed by the Spring Boot REST API.
// Routes call these instead of touching the network directly.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TasksApi, ProjectsApi, ResourcesApi, ScheduleApi } from "./api/services";
import type { Task, Project, Resource, ClassSession } from "./mock-data";

export const qk = {
  tasks: ["tasks"] as const,
  projects: ["projects"] as const,
  resources: ["resources"] as const,
  schedule: ["schedule"] as const,
};

// ---------- Tasks ----------
export function useTasks() {
  return useQuery({ queryKey: qk.tasks, queryFn: TasksApi.list });
}
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Task, "id">) => TasksApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks }),
  });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) => TasksApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks }),
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks }),
  });
}

// ---------- Projects ----------
export function useProjects() {
  return useQuery({ queryKey: qk.projects, queryFn: ProjectsApi.list });
}
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Project, "id">) => ProjectsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}
export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) => ProjectsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ProjectsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

// ---------- Resources ----------
export function useResources() {
  return useQuery({ queryKey: qk.resources, queryFn: ResourcesApi.list });
}
export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Resource, "id">) => ResourcesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resources }),
  });
}
export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ResourcesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resources }),
  });
}

// ---------- Schedule ----------
export function useSchedule() {
  return useQuery({ queryKey: qk.schedule, queryFn: ScheduleApi.list });
}
export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<ClassSession, "id">) => ScheduleApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedule }),
  });
}
export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ScheduleApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedule }),
  });
}
