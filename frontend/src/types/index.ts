// Статуси та пріоритети задач
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

// Проєкт
export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  color?: string;
}

// Задача
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

// Статистика
export interface ProjectStat {
  id: string;
  title: string;
  color: string;
  total: number;
  done: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  byStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  overdue: number;
  projectStats: ProjectStat[];
}

// API відповідь
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}
