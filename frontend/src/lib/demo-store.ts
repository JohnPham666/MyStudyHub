// @ts-nocheck
// In-memory mock store used when the app runs in demo mode (no backend).
import type { Task, Project, Resource, ClassSession } from "./mock-data";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const tasks: Task[] = [
  {
    id: "t1",
    title: "Complete PRJ301 assignment",
    description: "Build the JSP/Servlet web app with login & CRUD.",
    priority: "High",
    deadline: "2026-06-15T00:00:00Z",
    status: "In Progress",
    category: "Assignment",
    projectId: "p1",
  },
  {
    id: "t2",
    title: "Study for SWE401 midterm",
    description: "Chapters 1-5: requirements, UML, design patterns.",
    priority: "High",
    deadline: "2026-06-10T00:00:00Z",
    status: "Todo",
    category: "Study",
  },
  {
    id: "t3",
    title: "Prepare IELTS slides",
    description: "Create speaking part 2 cue card practice deck.",
    priority: "Medium",
    deadline: "2026-06-08T00:00:00Z",
    status: "Done",
    category: "English Teaching",
  },
  {
    id: "t4",
    title: "Group meeting — UX review",
    description: "Review wireframes for capstone project.",
    priority: "Medium",
    deadline: "2026-06-12T00:00:00Z",
    status: "In Progress",
    category: "Group Project",
    projectId: "p2",
  },
  {
    id: "t5",
    title: "Gym workout",
    description: "Leg day + 20 min cardio.",
    priority: "Low",
    deadline: "2026-06-07T00:00:00Z",
    status: "Todo",
    category: "Personal",
  },
  {
    id: "t6",
    title: "Read Clean Code ch.6-8",
    description: "Objects & data structures, error handling, boundaries.",
    priority: "Medium",
    deadline: "2026-06-20T00:00:00Z",
    status: "Todo",
    category: "Study",
  },
  {
    id: "t7",
    title: "Submit DBI202 lab 4",
    description: "SQL queries with JOINs and subqueries.",
    priority: "High",
    deadline: "2026-06-09T00:00:00Z",
    status: "Todo",
    category: "Assignment",
  },
  {
    id: "t8",
    title: "Prepare demo video",
    description: "3-min walkthrough of the capstone prototype.",
    priority: "Medium",
    deadline: "2026-06-14T00:00:00Z",
    status: "In Progress",
    category: "Group Project",
    projectId: "p2",
  },
];

const projects: Project[] = [
  {
    id: "p1",
    name: "PRJ301 — Java Web",
    description: "Servlet/JSP e-commerce mini project.",
    startDate: "2026-05-01",
    endDate: "2026-07-01",
    progress: 62,
    members: ["Minh", "Linh", "Huy"],
  },
  {
    id: "p2",
    name: "Capstone — Study Hub",
    description: "Productivity platform for students.",
    startDate: "2026-04-15",
    endDate: "2026-08-30",
    progress: 35,
    members: ["Minh", "Anh", "Khanh"],
  },
  {
    id: "p3",
    name: "SWE401 — Design Docs",
    description: "SRS, SDS, and test plan documents.",
    startDate: "2026-05-20",
    endDate: "2026-06-20",
    progress: 80,
    members: ["Minh"],
  },
];

const resources: Resource[] = [
  {
    id: "r1",
    subject: "PRJ301",
    fileLink: "https://drive.google.com/example-prj301",
    note: "Lecture slides week 1-8",
    tags: ["Java", "Servlet", "JSP"],
  },
  {
    id: "r2",
    subject: "SWE401",
    fileLink: "https://drive.google.com/example-swe401",
    note: "UML diagrams & design patterns cheatsheet",
    tags: ["UML", "Design Patterns"],
  },
  {
    id: "r3",
    subject: "DBI202",
    fileLink: "https://drive.google.com/example-dbi202",
    note: "SQL practice problems",
    tags: ["SQL", "Database"],
  },
  {
    id: "r4",
    subject: "IELTS",
    fileLink: "https://drive.google.com/example-ielts",
    note: "Speaking part 2 topics & model answers",
    tags: ["English", "IELTS"],
  },
];

const schedule: ClassSession[] = [
  {
    id: "s1",
    studentName: "Bảo Anh",
    subject: "IELTS Speaking 1-1",
    date: "2026-06-08",
    time: "19:30",
    duration: 60,
    note: "Practice part 2 cue cards",
  },
  {
    id: "s2",
    studentName: "Minh Châu",
    subject: "TOEIC Reading",
    date: "2026-06-10",
    time: "18:00",
    duration: 90,
    note: "Part 7 double passages",
  },
  {
    id: "s3",
    studentName: "Gia Huy",
    subject: "IELTS Writing",
    date: "2026-06-12",
    time: "20:00",
    duration: 60,
    note: "Task 2 argument essay structure",
  },
];

function extractId(path: string, prefix: string) {
  return path.startsWith(prefix) ? path.slice(prefix.length) : "";
}

function ok<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

function notFound() {
  return Promise.reject(new Error("Not found"));
}

export function handleDemoRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  // Tasks
  if (path === "/tasks" && method === "GET") return ok([...tasks]);
  if (path === "/tasks" && method === "POST") {
    const item = { ...(body as object), id: genId() } as Task;
    tasks.push(item);
    return ok(item);
  }
  {
    const id = extractId(path, "/tasks/");
    if (id && method === "PUT") {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return notFound();
      tasks[idx] = { ...tasks[idx], ...(body as Partial<Task>) };
      return ok(tasks[idx]);
    }
    if (id && method === "DELETE") {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return notFound();
      tasks.splice(idx, 1);
      return ok(undefined as T);
    }
  }

  // Projects
  if (path === "/projects" && method === "GET") return ok([...projects]);
  if (path === "/projects" && method === "POST") {
    const item = { ...(body as object), id: genId() } as Project;
    projects.push(item);
    return ok(item);
  }
  {
    const id = extractId(path, "/projects/");
    if (id && method === "PUT") {
      const idx = projects.findIndex((p) => p.id === id);
      if (idx === -1) return notFound();
      projects[idx] = { ...projects[idx], ...(body as Partial<Project>) };
      return ok(projects[idx]);
    }
    if (id && method === "DELETE") {
      const idx = projects.findIndex((p) => p.id === id);
      if (idx === -1) return notFound();
      projects.splice(idx, 1);
      return ok(undefined as T);
    }
  }

  // Resources
  if (path === "/resources" && method === "GET") return ok([...resources]);
  if (path === "/resources" && method === "POST") {
    const item = { ...(body as object), id: genId() } as Resource;
    resources.push(item);
    return ok(item);
  }
  {
    const id = extractId(path, "/resources/");
    if (id && method === "DELETE") {
      const idx = resources.findIndex((r) => r.id === id);
      if (idx === -1) return notFound();
      resources.splice(idx, 1);
      return ok(undefined as T);
    }
  }

  // Schedule
  if (path === "/schedule" && method === "GET") return ok([...schedule]);
  if (path === "/schedule" && method === "POST") {
    const item = { ...(body as object), id: genId() } as ClassSession;
    schedule.push(item);
    return ok(item);
  }
  {
    const id = extractId(path, "/schedule/");
    if (id && method === "DELETE") {
      const idx = schedule.findIndex((s) => s.id === id);
      if (idx === -1) return notFound();
      schedule.splice(idx, 1);
      return ok(undefined as T);
    }
  }

  return notFound();
}

export function clearDemoStore() {
  tasks.length = 0;
  projects.length = 0;
  resources.length = 0;
  schedule.length = 0;
  // Re-seed
  tasks.push(
    {
      id: "t1",
      title: "Complete PRJ301 assignment",
      description: "Build the JSP/Servlet web app with login & CRUD.",
      priority: "High",
      deadline: "2026-06-15T00:00:00Z",
      status: "In Progress",
      category: "Assignment",
      projectId: "p1",
    },
    {
      id: "t2",
      title: "Study for SWE401 midterm",
      description: "Chapters 1-5: requirements, UML, design patterns.",
      priority: "High",
      deadline: "2026-06-10T00:00:00Z",
      status: "Todo",
      category: "Study",
    },
    {
      id: "t3",
      title: "Prepare IELTS slides",
      description: "Create speaking part 2 cue card practice deck.",
      priority: "Medium",
      deadline: "2026-06-08T00:00:00Z",
      status: "Done",
      category: "English Teaching",
    },
    {
      id: "t4",
      title: "Group meeting — UX review",
      description: "Review wireframes for capstone project.",
      priority: "Medium",
      deadline: "2026-06-12T00:00:00Z",
      status: "In Progress",
      category: "Group Project",
      projectId: "p2",
    },
    {
      id: "t5",
      title: "Gym workout",
      description: "Leg day + 20 min cardio.",
      priority: "Low",
      deadline: "2026-06-07T00:00:00Z",
      status: "Todo",
      category: "Personal",
    },
    {
      id: "t6",
      title: "Read Clean Code ch.6-8",
      description: "Objects & data structures, error handling, boundaries.",
      priority: "Medium",
      deadline: "2026-06-20T00:00:00Z",
      status: "Todo",
      category: "Study",
    },
    {
      id: "t7",
      title: "Submit DBI202 lab 4",
      description: "SQL queries with JOINs and subqueries.",
      priority: "High",
      deadline: "2026-06-09T00:00:00Z",
      status: "Todo",
      category: "Assignment",
    },
    {
      id: "t8",
      title: "Prepare demo video",
      description: "3-min walkthrough of the capstone prototype.",
      priority: "Medium",
      deadline: "2026-06-14T00:00:00Z",
      status: "In Progress",
      category: "Group Project",
      projectId: "p2",
    }
  );
  projects.push(
    {
      id: "p1",
      name: "PRJ301 — Java Web",
      description: "Servlet/JSP e-commerce mini project.",
      startDate: "2026-05-01",
      endDate: "2026-07-01",
      progress: 62,
      members: ["Minh", "Linh", "Huy"],
    },
    {
      id: "p2",
      name: "Capstone — Study Hub",
      description: "Productivity platform for students.",
      startDate: "2026-04-15",
      endDate: "2026-08-30",
      progress: 35,
      members: ["Minh", "Anh", "Khanh"],
    },
    {
      id: "p3",
      name: "SWE401 — Design Docs",
      description: "SRS, SDS, and test plan documents.",
      startDate: "2026-05-20",
      endDate: "2026-06-20",
      progress: 80,
      members: ["Minh"],
    }
  );
  resources.push(
    {
      id: "r1",
      subject: "PRJ301",
      fileLink: "https://drive.google.com/example-prj301",
      note: "Lecture slides week 1-8",
      tags: ["Java", "Servlet", "JSP"],
    },
    {
      id: "r2",
      subject: "SWE401",
      fileLink: "https://drive.google.com/example-swe401",
      note: "UML diagrams & design patterns cheatsheet",
      tags: ["UML", "Design Patterns"],
    },
    {
      id: "r3",
      subject: "DBI202",
      fileLink: "https://drive.google.com/example-dbi202",
      note: "SQL practice problems",
      tags: ["SQL", "Database"],
    },
    {
      id: "r4",
      subject: "IELTS",
      fileLink: "https://drive.google.com/example-ielts",
      note: "Speaking part 2 topics & model answers",
      tags: ["English", "IELTS"],
    }
  );
  schedule.push(
    {
      id: "s1",
      studentName: "Bảo Anh",
      subject: "IELTS Speaking 1-1",
      date: "2026-06-08",
      time: "19:30",
      duration: 60,
      note: "Practice part 2 cue cards",
    },
    {
      id: "s2",
      studentName: "Minh Châu",
      subject: "TOEIC Reading",
      date: "2026-06-10",
      time: "18:00",
      duration: 90,
      note: "Part 7 double passages",
    },
    {
      id: "s3",
      studentName: "Gia Huy",
      subject: "IELTS Writing",
      date: "2026-06-12",
      time: "20:00",
      duration: 60,
      note: "Task 2 argument essay structure",
    }
  );
}
