import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import type {
  Project, CreateProjectDto, UpdateProjectDto,
  Task, CreateTaskDto, UpdateTaskDto,
  DashboardStats,
} from '@/types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Projects
export const getProjects   = (): Promise<Project[]>  =>
  api.get('/projects').then(r => r.data.data);

export const createProject = (data: CreateProjectDto): Promise<Project> =>
  api.post('/projects', data).then(r => r.data.data);

export const updateProject = (id: string, data: UpdateProjectDto): Promise<Project> =>
  api.put(`/projects/${id}`, data).then(r => r.data.data);

export const deleteProject = (id: string): Promise<{ message: string }> =>
  api.delete(`/projects/${id}`).then(r => r.data.data);

// Tasks
export const getTasks = (projectId: string): Promise<Task[]> =>
  api.get(`/projects/${projectId}/tasks`).then(r => r.data.data);

export const createTask = (projectId: string, data: CreateTaskDto): Promise<Task> =>
  api.post(`/projects/${projectId}/tasks`, data).then(r => r.data.data);

export const updateTask = (projectId: string, taskId: string, data: UpdateTaskDto): Promise<Task> =>
  api.put(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data.data);

export const deleteTask = (projectId: string, taskId: string): Promise<{ message: string }> =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data.data);

// Stats
export const getStats = (): Promise<DashboardStats> =>
  api.get('/stats').then(r => r.data.data);
