import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress, LinearProgress, Chip, MenuItem,
  Select, FormControl, InputLabel, Paper, Checkbox,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, CalendarToday, PriorityHigh, Close } from '@mui/icons-material';
import { getTasks, createTask, updateTask, deleteTask } from '@/api';
import type { Task, CreateTaskDto, TaskStatus, TaskPriority } from '@/types';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ColumnContainer = styled(Paper)`
  background: #fafafa;
  border: 1px solid #f0f0f3;
  border-radius: 12px;
  padding: 16px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: none;
  min-width: 320px;
  flex: 1;
`;

const TaskCard = styled(Paper)<{ priority: TaskPriority }>`
  background: #ffffff;
  border: 1px solid #f0f0f3;
  border-left: 4px solid ${({ priority }) =>
    priority === 'high' ? '#ff4d4f' : priority === 'medium' ? '#faad14' : '#1890ff'};
  border-radius: 8px;
  padding: 16px;
  box-shadow: none;
  transition: all 0.2s ease;
  &:hover {
    border-color: #cfcdc4;
  }
`;

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Треба зробити',
  in_progress: 'В процесі',
  done: 'Виконано',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export default function TasksPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>({
    title: '', description: '', status: 'todo', priority: 'medium', dueDate: '',
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    const editTaskId = location.state?.editTaskId;
    if (editTaskId && tasks.length > 0) {
      const taskToEdit = tasks.find(t => t.id === editTaskId);
      if (taskToEdit) {
        handleOpen(taskToEdit);
        // Clear state so it doesn't reopen on reload
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, tasks, navigate, location.pathname]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => createTask(projectId!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', projectId] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CreateTaskDto }) => updateTask(projectId!, taskId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', projectId] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId!, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedTasks.map(id => deleteTask(projectId!, id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      setSelectedTasks([]);
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async (newStatus: TaskStatus) => {
      const selected = tasks.filter(t => selectedTasks.includes(t.id));
      await Promise.all(selected.map(task => 
        updateTask(projectId!, task.id, { ...task, status: newStatus } as unknown as CreateTaskDto)
      ));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      setSelectedTasks([]);
    },
  });

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditTask(task);
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setEditTask(null);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' });
    }
    setPreviewMode(false);
    setDialogOpen(true);
  };

  const handleClose = () => { setDialogOpen(false); setEditTask(null); setPreviewMode(false); };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const data: CreateTaskDto = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    if (editTask) {
      updateMutation.mutate({ taskId: editTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateMutation.mutate({
      taskId: task.id,
      data: { status: newStatus } as any,
    });
  };

  if (isLoading) return <LinearProgress />;

  const columns: TaskStatus[] = ['todo', 'in_progress', 'done'];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <IconButton onClick={() => navigate('/projects')} sx={{ border: '1px solid #f0f0f3' }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Задачі проєкту</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Нова задача
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { height: 8 } }}>
        {columns.map((status) => {
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <Box key={status}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {STATUS_LABELS[status]}
                <Chip label={columnTasks.length} size="small" sx={{ bgcolor: '#f0f0f3' }} />
              </Typography>
              <ColumnContainer>
                {columnTasks.map(task => (
                  <TaskCard key={task.id} priority={task.priority}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox size="small" sx={{ p: 0 }} checked={selectedTasks.includes(task.id)} onChange={() => toggleSelectTask(task.id)} />
                        <Typography sx={{ fontWeight: 600 }}>{task.title}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'nowrap', ml: 1, flexShrink: 0 }}>
                        <IconButton size="small" onClick={() => handleOpen(task)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(task.id)}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    
                    {task.description && (
                      <Box sx={{ mb: 2, '& p, & ul, & ol': { m: 0, mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {task.description}
                        </ReactMarkdown>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                      {task.dueDate && (
                        <Chip size="small" icon={<CalendarToday fontSize="small" />} label={new Date(task.dueDate).toLocaleDateString()} sx={{ bgcolor: '#f0f0f3' }} />
                      )}
                      
                      <FormControl size="small" variant="standard" sx={{ minWidth: 100, ml: 'auto' }}>
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          disableUnderline
                          sx={{ fontSize: '0.75rem', color: 'text.secondary', '.MuiSelect-select': { py: 0.5 } }}
                        >
                          <MenuItem value="todo">Треба зробити</MenuItem>
                          <MenuItem value="in_progress">В процесі</MenuItem>
                          <MenuItem value="done">Виконано</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TaskCard>
                ))}
                {columnTasks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                    Немає задач
                  </Typography>
                )}
              </ColumnContainer>
            </Box>
          );
        })}
      </Box>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Редагувати задачу' : 'Нова задача'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Назва *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} sx={{ mb: 3 }} autoFocus />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Опис (Markdown підтримується)</Typography>
            <Button size="small" onClick={() => setPreviewMode(!previewMode)} sx={{ textTransform: 'none', py: 0 }}>
              {previewMode ? 'Редагувати' : 'Попередній перегляд'}
            </Button>
          </Box>
          {previewMode ? (
            <Box sx={{ minHeight: 90, mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f3', '& p': { m: 0, mt: 0.5, fontSize: '0.875rem' } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description || '*Немає опису*'}</ReactMarkdown>
            </Box>
          ) : (
            <TextField fullWidth multiline rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} sx={{ mb: 3 }} placeholder="**Жирний** або *курсив*..." />
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select value={form.status} label="Статус" onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                <MenuItem value="todo">Треба зробити</MenuItem>
                <MenuItem value="in_progress">В процесі</MenuItem>
                <MenuItem value="done">Виконано</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Пріоритет</InputLabel>
              <Select value={form.priority} label="Пріоритет" onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}>
                <MenuItem value="low">Низький</MenuItem>
                <MenuItem value="medium">Середній</MenuItem>
                <MenuItem value="high">Високий</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>Дедлайн</Typography>
            <TextField fullWidth type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? <CircularProgress size={20} /> : editTask ? 'Зберегти' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Bulk Actions Toolbar */}
      {selectedTasks.length > 0 && (
        <Paper elevation={6} sx={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          px: 3, py: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3,
          bgcolor: '#171717', color: '#ffffff', zIndex: 1000
        }}>
          <Typography sx={{ fontWeight: 600 }}>Обрано: {selectedTasks.length}</Typography>
          
          <Box sx={{ borderLeft: '1px solid #404040', height: 24 }} />
          
          <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
            <Select
              value=""
              displayEmpty
              onChange={(e) => bulkUpdateStatusMutation.mutate(e.target.value as TaskStatus)}
              disableUnderline
              sx={{ color: '#ffffff', '.MuiSelect-icon': { color: '#ffffff' }, fontSize: '0.875rem' }}
              disabled={bulkUpdateStatusMutation.isPending}
            >
              <MenuItem value="" disabled>Змінити статус...</MenuItem>
              <MenuItem value="todo">Треба зробити</MenuItem>
              <MenuItem value="in_progress">В процесі</MenuItem>
              <MenuItem value="done">Виконано</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={() => bulkDeleteMutation.mutate()}
            disabled={bulkDeleteMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {bulkDeleteMutation.isPending ? 'Видалення...' : 'Видалити'}
          </Button>

          <IconButton size="small" onClick={() => setSelectedTasks([])} sx={{ color: '#ffffff', ml: 1 }}>
            <Close fontSize="small" />
          </IconButton>
        </Paper>
      )}
    </Box>
  );
}
