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

-- Members là chuỗi tên đơn giản
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
    CONSTRAINT FK_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE NO ACTION,
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
