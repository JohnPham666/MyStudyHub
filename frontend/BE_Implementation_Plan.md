# Student Productivity Hub — Backend Implementation Plan

> Mục tiêu: Build backend **Spring Boot 3 + JDK 21 + MS SQL Server** phục vụ frontend React (đã có sẵn). Frontend gọi API tại `${VITE_API_URL}` (mặc định `http://localhost:8080/api`) với JWT (access + refresh).
> Phong cách: code **rõ ràng, dễ maintain, dễ scale**, phù hợp sinh viên đọc và mở rộng.

---

## 1. Tech Stack & Dependencies

- **Java 21**, **Spring Boot 3.3.x**, Maven
- **Spring Web**, **Spring Security**, **Spring Data JPA**, **Validation**
- **MS SQL Server** + driver `mssql-jdbc`
- **Hibernate dialect**: `org.hibernate.dialect.SQLServerDialect`
- **JJWT 0.12.x** (`io.jsonwebtoken:jjwt-api/impl/jackson`)
- **Lombok**, **MapStruct** (tuỳ chọn — dễ maintain DTO)
- **Flyway** (migration DB — bắt buộc để script DB có version)
- **springdoc-openapi** (Swagger UI tại `/api/swagger-ui.html`)

`pom.xml` dependency chính:
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
<dependency><groupId>com.microsoft.sqlserver</groupId><artifactId>mssql-jdbc</artifactId><scope>runtime</scope></dependency>
<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-sqlserver</artifactId></dependency>
<dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.12.6</version></dependency>
<dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>0.12.6</version><scope>runtime</scope></dependency>
<dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>0.12.6</version><scope>runtime</scope></dependency>
<dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
<dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>2.6.0</version></dependency>
```

---

## 2. Project Structure (package-by-feature)

```
com.studyhub
├── StudyHubApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── OpenApiConfig.java
│   └── JpaAuditingConfig.java
├── common/
│   ├── BaseEntity.java          // id, createdAt, updatedAt
│   ├── ApiError.java            // error response DTO
│   ├── GlobalExceptionHandler.java
│   └── PageResponse.java
├── security/
│   ├── JwtService.java
│   ├── JwtAuthFilter.java
│   ├── CustomUserDetailsService.java
│   └── AuthenticatedUser.java   // helper lấy current userId
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── dto/  (LoginRequest, RegisterRequest, RefreshRequest, AuthResponse, UserDto)
│   └── RefreshToken.java + RefreshTokenRepository
├── user/
│   ├── User.java, UserRepository.java
├── task/
│   ├── Task.java, TaskRepository.java
│   ├── TaskController.java, TaskService.java
│   └── dto/ (TaskDto, CreateTaskRequest, UpdateTaskRequest)
├── project/   (Project + members)
├── resource/  (Resource + tags)
└── schedule/  (ClassSession)
```

Quy ước: **Controller** mỏng → **Service** chứa business logic → **Repository** JPA. DTO tách khỏi entity, mapping bằng MapStruct hoặc helper tĩnh.

---

## 3. Cấu hình `application.yml`

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=studyhub;encrypt=true;trustServerCertificate=true
    username: sa
    password: ${DB_PASSWORD:Your_password123}
  jpa:
    hibernate.ddl-auto: validate     # KHÔNG dùng update — DB do Flyway quản
    properties.hibernate.dialect: org.hibernate.dialect.SQLServerDialect
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

app:
  jwt:
    secret: ${JWT_SECRET:please-change-this-to-a-32+chars-secret}
    access-ttl-seconds: 900           # 15 min
    refresh-ttl-seconds: 1209600      # 14 days
  cors:
    allowed-origins:
      - http://localhost:5173
      - http://localhost:3000
      - https://*.lovable.app
```

---

## 4. Database Script (Flyway migrations)

Đặt file dưới `src/main/resources/db/migration/`. Dùng MS SQL Server syntax. Mỗi bảng có `id BIGINT IDENTITY` PK, `created_at`, `updated_at`. Foreign key có `ON DELETE CASCADE` khi sở hữu bởi user.

### `V1__init_schema.sql`

```sql
-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    username     NVARCHAR(50)  NOT NULL UNIQUE,
    email        NVARCHAR(150) NOT NULL UNIQUE,
    password     NVARCHAR(255) NOT NULL,         -- BCrypt hash
    full_name    NVARCHAR(150) NULL,
    enabled      BIT NOT NULL DEFAULT 1,
    created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_users_email ON users(email);

-- =========================================
-- REFRESH TOKENS  (rotate-on-use)
-- =========================================
CREATE TABLE refresh_tokens (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token       NVARCHAR(512) NOT NULL UNIQUE,   -- random 256-bit base64
    expires_at  DATETIME2 NOT NULL,
    revoked     BIT NOT NULL DEFAULT 0,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IX_refresh_user ON refresh_tokens(user_id);

-- =========================================
-- PROJECTS
-- =========================================
CREATE TABLE projects (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    owner_id     BIGINT NOT NULL,
    name         NVARCHAR(200) NOT NULL,
    description  NVARCHAR(1000) NULL,
    start_date   DATE NULL,
    end_date     DATE NULL,
    progress     INT NOT NULL DEFAULT 0,   -- 0..100
    created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_project_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT CK_project_progress CHECK (progress BETWEEN 0 AND 100)
);
CREATE INDEX IX_projects_owner ON projects(owner_id);

-- Members là chuỗi tên đơn giản (frontend đang dùng string[]).
CREATE TABLE project_members (
    project_id   BIGINT NOT NULL,
    member_name  NVARCHAR(150) NOT NULL,
    CONSTRAINT PK_project_members PRIMARY KEY (project_id, member_name),
    CONSTRAINT FK_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =========================================
-- TASKS
-- =========================================
CREATE TABLE tasks (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    owner_id     BIGINT NOT NULL,
    project_id   BIGINT NULL,
    title        NVARCHAR(255) NOT NULL,
    description  NVARCHAR(2000) NULL,
    priority     NVARCHAR(10)  NOT NULL,   -- Low|Medium|High
    status       NVARCHAR(20)  NOT NULL,   -- Todo|In Progress|Done
    category     NVARCHAR(30)  NOT NULL,   -- Study|Assignment|Group Project|English Teaching|Personal
    deadline     DATETIME2     NULL,
    created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_task_owner   FOREIGN KEY (owner_id)   REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT FK_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT CK_task_priority CHECK (priority IN ('Low','Medium','High')),
    CONSTRAINT CK_task_status   CHECK (status   IN ('Todo','In Progress','Done')),
    CONSTRAINT CK_task_category CHECK (category IN ('Study','Assignment','Group Project','English Teaching','Personal'))
);
CREATE INDEX IX_tasks_owner    ON tasks(owner_id);
CREATE INDEX IX_tasks_project  ON tasks(project_id);
CREATE INDEX IX_tasks_deadline ON tasks(deadline);

-- =========================================
-- RESOURCES (tài liệu học tập)
-- =========================================
CREATE TABLE resources (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    subject     NVARCHAR(100) NOT NULL,
    file_link   NVARCHAR(500) NOT NULL,
    note        NVARCHAR(1000) NULL,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_resource_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IX_resources_owner ON resources(owner_id);

CREATE TABLE resource_tags (
    resource_id BIGINT NOT NULL,
    tag         NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_resource_tags PRIMARY KEY (resource_id, tag),
    CONSTRAINT FK_rt_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- =========================================
-- CLASS SESSIONS (lịch dạy English)
-- =========================================
CREATE TABLE class_sessions (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    owner_id     BIGINT NOT NULL,
    student_name NVARCHAR(150) NOT NULL,
    subject      NVARCHAR(150) NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration     INT  NOT NULL,         -- minutes
    note         NVARCHAR(1000) NULL,
    created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_class_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT CK_class_duration CHECK (duration > 0 AND duration <= 600)
);
CREATE INDEX IX_class_owner_date ON class_sessions(owner_id, session_date);
```

### `V2__seed_demo_user.sql` (tuỳ chọn)

```sql
-- Mật khẩu: demo1234 (BCrypt hash gen sẵn). KHÔNG dùng cho production.
INSERT INTO users (username, email, password, full_name)
VALUES ('demo', 'demo@studyhub.local',
        '$2a$10$Dm6mP3jHkS1J0e3w0w8m8u3y2j2yQqv3sH0a3o0gT4mC4l9rT2qHO',
        N'Demo Student');
```

---

## 5. JPA Entity mẫu

```java
// common/BaseEntity.java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @CreatedDate  @Column(name = "created_at", updatable = false) private Instant createdAt;
    @LastModifiedDate @Column(name = "updated_at") private Instant updatedAt;
}

// task/Task.java
@Entity @Table(name = "tasks")
@Getter @Setter @NoArgsConstructor
public class Task extends BaseEntity {
    @Column(name = "owner_id", nullable = false) private Long ownerId;
    @Column(name = "project_id") private Long projectId;
    @Column(nullable = false) private String title;
    @Column(length = 2000) private String description;
    @Enumerated(EnumType.STRING) private Priority priority;
    @Enumerated(EnumType.STRING) private Status   status;
    @Enumerated(EnumType.STRING) private Category category;
    private Instant deadline;
}
```

Enum `Priority/Status/Category` đặt trong package `task` — value phải khớp chuỗi DB (`@Enumerated(EnumType.STRING)`). Với value có khoảng trắng như `"In Progress"`, dùng `@JsonValue/@JsonCreator` hoặc tách thành 2 enum constant + custom converter.

---

## 6. REST API — đầy đủ endpoint

Base path: `/api`. Tất cả (trừ `/auth/**`) yêu cầu `Authorization: Bearer <accessToken>`.
Mọi request đều **lọc theo `ownerId = currentUserId`** (đa người dùng, không leak data).

### 6.1 Auth
| Method | Path              | Body                                            | Response                                                   |
|--------|-------------------|-------------------------------------------------|------------------------------------------------------------|
| POST   | `/auth/register`  | `{username, email, password, fullName?}`        | `{accessToken, refreshToken, user}`                        |
| POST   | `/auth/login`     | `{usernameOrEmail, password}`                   | `{accessToken, refreshToken, user}`                        |
| POST   | `/auth/refresh`   | `{refreshToken}`                                | `{accessToken, refreshToken}` (rotate)                     |
| POST   | `/auth/logout`    | `{refreshToken}`                                | `204` (revoke refresh token)                               |
| GET    | `/auth/me`        | —                                               | `{id, username, email, fullName}`                          |

Rule:
- Password hash: `BCryptPasswordEncoder(strength=10)`.
- Access token: JWT HS256, claim `sub=userId`, `username`, `exp`.
- Refresh token: opaque random (32 bytes, base64), lưu DB, **rotate-on-use** + revoke cái cũ.
- Khi access hết hạn frontend tự gọi `/auth/refresh` (đã code sẵn ở `client.ts`).

### 6.2 Tasks
| Method | Path             | Query / Body                                     | Mô tả                          |
|--------|------------------|--------------------------------------------------|--------------------------------|
| GET    | `/tasks`         | `?status=&category=&projectId=&q=`               | List của user hiện tại         |
| GET    | `/tasks/{id}`    | —                                                | Chi tiết (kiểm tra ownerId)    |
| POST   | `/tasks`         | `CreateTaskRequest`                              | Tạo                            |
| PUT    | `/tasks/{id}`    | `UpdateTaskRequest` (partial cho phép)           | Cập nhật                       |
| DELETE | `/tasks/{id}`    | —                                                | Xoá → `204`                    |

### 6.3 Projects
| Method | Path                     | Body                              | Mô tả                       |
|--------|--------------------------|-----------------------------------|-----------------------------|
| GET    | `/projects`              | —                                 | List                        |
| GET    | `/projects/{id}`         | —                                 | Detail                      |
| POST   | `/projects`              | `{name, description, startDate, endDate, progress, members[]}` | Tạo |
| PUT    | `/projects/{id}`         | partial                           | Cập nhật + replace members  |
| DELETE | `/projects/{id}`         | —                                 | Xoá (task.projectId → null) |

### 6.4 Resources
| Method | Path                  | Body                                       |
|--------|-----------------------|--------------------------------------------|
| GET    | `/resources`          | `?subject=&tag=&q=`                        |
| POST   | `/resources`          | `{subject, fileLink, note, tags[]}`        |
| PUT    | `/resources/{id}`     | partial                                     |
| DELETE | `/resources/{id}`     | —                                          |

### 6.5 Schedule (class sessions)
| Method | Path                  | Body / Query                                                  |
|--------|-----------------------|---------------------------------------------------------------|
| GET    | `/schedule`           | `?from=YYYY-MM-DD&to=YYYY-MM-DD`                              |
| POST   | `/schedule`           | `{studentName, subject, date, time, duration, note?}`         |
| PUT    | `/schedule/{id}`      | partial                                                       |
| DELETE | `/schedule/{id}`      | —                                                             |

### 6.6 DTO Contract (khớp frontend hiện tại)

```jsonc
// Task response
{
  "id": "1", "title": "...", "description": "...",
  "priority": "Low|Medium|High",
  "status":   "Todo|In Progress|Done",
  "category": "Study|Assignment|Group Project|English Teaching|Personal",
  "deadline": "2026-06-10T00:00:00Z",
  "projectId": "1"        // null nếu không thuộc project
}
```
- `id` và `projectId` serialize thành **string** (frontend đã coerce, BE nên trả string cho ổn định) → dùng `@JsonSerialize(using = ToStringSerializer.class)` hoặc Jackson mixin.

---

## 7. Security & JWT Flow

`SecurityConfig` (chuẩn Spring Security 6):

```java
@Bean SecurityFilterChain chain(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
    http
      .cors(Customizer.withDefaults())
      .csrf(c -> c.disable())
      .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
      .authorizeHttpRequests(reg -> reg
          .requestMatchers("/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
          .anyRequest().authenticated())
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
      .exceptionHandling(e -> e
          .authenticationEntryPoint((req,res,ex) -> res.sendError(401, "Unauthorized")));
    return http.build();
}
```

`JwtAuthFilter`:
1. Đọc header `Authorization: Bearer ...`.
2. Verify chữ ký + `exp`.
3. Set `SecurityContext` với `AuthenticatedUser(userId, username)`.

Helper `CurrentUser`:
```java
public static Long id() {
   var p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
   return ((AuthenticatedUser) p).userId();
}
```

CORS bean: như `app.cors.allowed-origins` + methods `GET,POST,PUT,PATCH,DELETE,OPTIONS`, header `Authorization,Content-Type`, `allowCredentials=true`.

---

## 8. Validation & Error Handling

- DTO request dùng `@NotBlank`, `@Size`, `@Email`, `@Min/@Max`.
- `GlobalExceptionHandler` (`@RestControllerAdvice`) map:
  - `MethodArgumentNotValidException` → 400 `{message, fieldErrors}`.
  - `EntityNotFoundException` → 404.
  - `AccessDeniedException` → 403.
  - `BadCredentialsException` → 401.
  - Default → 500 + log.
- Trả body chuẩn:
  ```json
  { "timestamp": "...", "status": 400, "message": "Validation failed",
    "fieldErrors": { "email": "must be a well-formed email" } }
  ```

---

## 9. Service Logic Rules

- **Ownership check** mọi GET/PUT/DELETE: nếu `entity.ownerId != currentUserId` → `404` (không phải 403, tránh leak tồn tại).
- **Project delete**: chỉ set `task.project_id = null` (DB đã `ON DELETE SET NULL`).
- **Task progress của Project**: có thể compute trên-the-fly = `done / total * 100`, hoặc giữ field `progress` do user nhập (theo frontend hiện tại — giữ field).
- **Schedule conflict**: tuỳ chọn — service có thể warn khi 2 session cùng `ownerId + date` trùng `[time, time+duration)`.
- **Pagination**: list endpoints chấp nhận `?page=&size=&sort=` (Spring `Pageable`) trả `PageResponse<T>`. Mặc định `size=50`.

---

## 10. Testing & Tooling

- **Unit**: JUnit 5 + Mockito cho Service.
- **Integration**: `@SpringBootTest` + Testcontainers `mssqlserver:2022-latest`.
- **Postman / Swagger UI**: `http://localhost:8080/api/swagger-ui.html` để FE/QA test.
- **Logging**: SLF4J, level INFO; bật `org.hibernate.SQL=DEBUG` khi cần debug.

---

## 11. Run Local

```bash
# 1. Chạy MS SQL bằng Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Your_password123" \
           -p 1433:1433 --name studyhub-mssql -d mcr.microsoft.com/mssql/server:2022-latest

# 2. Tạo DB
docker exec -it studyhub-mssql /opt/mssql-tools18/bin/sqlcmd \
   -S localhost -U sa -P 'Your_password123' -No \
   -Q "CREATE DATABASE studyhub;"

# 3. Chạy app — Flyway tự migrate
./mvnw spring-boot:run
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:8080/api
```

---

## 12. Checklist bàn giao cho AI code BE

- [ ] Tạo project Maven, cấu hình `pom.xml` & `application.yml` như §1, §3
- [ ] Viết Flyway `V1__init_schema.sql` đúng §4
- [ ] Tạo entity + repository cho User, RefreshToken, Project, ProjectMember, Task, Resource, ResourceTag, ClassSession
- [ ] `JwtService`, `JwtAuthFilter`, `SecurityConfig`, `CorsConfig`
- [ ] `AuthService` + `AuthController` (register/login/refresh/logout/me) — rotate refresh
- [ ] CRUD service+controller cho Tasks / Projects / Resources / Schedule có **ownership filter**
- [ ] `GlobalExceptionHandler`, validation đầy đủ
- [ ] Serialize `id` (Long) → string trong JSON
- [ ] Bật Swagger UI
- [ ] Seed user demo (tuỳ chọn V2)
- [ ] Smoke test: register → login → tạo Task → list → update → delete; refresh token; CORS từ `localhost:5173`.

Khi xong, FE chỉ cần đổi `VITE_API_URL` và đăng nhập là chạy được toàn bộ flow đã thấy ở demo mode.
