# Student Productivity Hub — Frontend

Minimal, dark, Notion/Linear-inspired dashboard for managing classes,
deadlines, group projects, study resources, and English-tutoring sessions.

Stack: **React 19 + TanStack Router/Start + TanStack Query + Tailwind v4 + shadcn/ui**.
The frontend is fully wired to a **Spring Boot REST API with JWT (access +
refresh)** — no mock data anymore.

---

## 1. Setup

```bash
bun install        # or: npm install
cp .env.example .env
# edit .env → VITE_API_URL pointing to your Spring Boot backend
bun dev
```

Open `http://localhost:5173` (or the port Vite reports).

> If `VITE_API_URL` is not set, the client defaults to
> `http://localhost:8080/api`.

---

## 2. Expected backend contract

Base URL = `${VITE_API_URL}` (e.g. `http://localhost:8080/api`).

### Auth

| Method | Path             | Body                                                      | Response                                                |
| ------ | ---------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| POST   | `/auth/login`    | `{ usernameOrEmail, password }`                           | `{ accessToken, refreshToken, user }`                   |
| POST   | `/auth/register` | `{ username, email, password, fullName? }`                | `{ accessToken, refreshToken, user }`                   |
| POST   | `/auth/refresh`  | `{ refreshToken }`                                        | `{ accessToken, refreshToken? }`                        |
| GET    | `/auth/me`       | — (Bearer)                                                | `{ id, username, email, fullName? }`                    |

The client auto-attaches `Authorization: Bearer <accessToken>` and
transparently calls `/auth/refresh` on a 401, retrying the original request.
If the refresh fails the user is signed out.

### Resources (all require Bearer token)

| Method | Path              | Purpose                       |
| ------ | ----------------- | ----------------------------- |
| GET    | `/tasks`          | list current user's tasks     |
| POST   | `/tasks`          | create task                   |
| PUT    | `/tasks/{id}`     | update task                   |
| DELETE | `/tasks/{id}`     | delete task                   |
| GET/POST/PUT/DELETE | `/projects[...]`   | same shape |
| GET/POST/DELETE     | `/resources[...]`  | same shape |
| GET/POST/DELETE     | `/schedule[...]`   | English-teaching classes |

### DTO shapes

```jsonc
// Task
{ "id":"1","title":"...","description":"...","priority":"Low|Medium|High",
  "deadline":"2026-06-10T00:00:00Z","status":"Todo|In Progress|Done",
  "category":"Study|Assignment|Group Project|English Teaching|Personal",
  "projectId":"1" }

// Project
{ "id":"1","name":"...","description":"...","startDate":"2026-05-01",
  "endDate":"2026-07-01","progress":62,"members":["Minh","Linh"] }

// Resource
{ "id":"1","subject":"PRJ301","fileLink":"https://...","note":"...","tags":["Java"] }

// ClassSession (schedule)
{ "id":"1","studentName":"Bảo Anh","subject":"IELTS Speaking 1-1",
  "date":"2026-06-02","time":"19:30","duration":60,"note":"..." }
```

IDs may be `Long` on the backend — the client coerces them to string.

---

## 3. Spring Boot CORS config

Allow the Vite dev origin (default `http://localhost:5173`) and your deployed
Lovable preview/published URLs.

```java
// SecurityConfig.java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(reg -> reg
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}

@Bean
CorsConfigurationSource corsConfigurationSource() {
    var cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.lovable.app",
        "https://your-domain.com"
    ));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    cfg.setAllowedHeaders(List.of("Authorization","Content-Type"));
    cfg.setExposedHeaders(List.of("Authorization"));
    cfg.setAllowCredentials(true);

    var src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return src;
}
```

`application.yml`:

```yaml
server:
  port: 8080
  servlet:
    context-path: /api
app:
  jwt:
    secret: change-me-in-production
    access-ttl-seconds: 900       # 15 min
    refresh-ttl-seconds: 1209600  # 14 days
```

---

## 4. Project structure

```
src/
├─ lib/
│  ├─ api/
│  │  ├─ client.ts       # fetch wrapper + JWT refresh
│  │  ├─ auth.ts         # login/register/me
│  │  └─ services.ts     # Tasks/Projects/Resources/Schedule APIs
│  ├─ auth-context.tsx   # AuthProvider, useAuth()
│  ├─ data.ts            # React Query hooks (useTasks, useCreateTask, …)
│  └─ mock-data.ts       # domain types + colors (no more mock store)
├─ routes/
│  ├─ __root.tsx         # QueryClientProvider + AuthProvider + AuthGate
│  ├─ login.tsx          # public
│  ├─ register.tsx       # public
│  ├─ index.tsx          # dashboard
│  ├─ tasks.tsx
│  ├─ projects.tsx
│  ├─ resources.tsx
│  ├─ schedule.tsx
│  └─ analytics.tsx
└─ components/
   ├─ AppShell.tsx       # sidebar + topbar + sign-out
   └─ ui/                # shadcn/ui primitives
```

All protected routes redirect to `/login` when the access token is absent
or expired and `/auth/refresh` fails.

---

## 5. Troubleshooting

* **CORS error** — your origin isn't in `setAllowedOrigins`. Add it (see §3).
* **401 on every call** — your access token might not include the userId
  claim the backend expects, or refresh endpoint is missing. Hit
  `POST /auth/refresh` manually with the stored `sph_refresh_token` to verify.
* **Network error / blank list** — check `VITE_API_URL` in `.env` matches the
  Spring Boot URL and that the backend is running.
