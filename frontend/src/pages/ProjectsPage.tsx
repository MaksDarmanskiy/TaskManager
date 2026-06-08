import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Card, CardContent, CardActions, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, CircularProgress,
  Chip, LinearProgress,
} from '@mui/material';
import { Add, Edit, Delete, ArrowForward, FolderOpen } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { getProjects, createProject, updateProject, deleteProject } from '@/api';
import type { Project, CreateProjectDto } from '@/types';

const PROJECT_COLORS = ['#6366f1','#22d3ee','#34d399','#fb923c','#f43f5e','#a78bfa','#ec4899','#fbbf24'];

interface ProjectFormData { title: string; description: string; color: string; }

export default function ProjectsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>({ title: '', description: '', color: '#6366f1' });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectDto) => createProject(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProjectDto }) => updateProject(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditProject(project);
      setForm({ title: project.title, description: project.description, color: project.color });
    } else {
      setEditProject(null);
      setForm({ title: '', description: '', color: '#6366f1' });
    }
    setDialogOpen(true);
  };

  const handleClose = () => { setDialogOpen(false); setEditProject(null); };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editProject) {
      updateMutation.mutate({ id: editProject.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Проєкти</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Новий проєкт
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {projects.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', py: 8, textAlign: 'center' }}>
            <FolderOpen sx={{ fontSize: 64, color: '#dcdee0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Ще немає проєктів</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Створи перший проєкт щоб почати</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Створити проєкт</Button>
          </Box>
        ) : (
          projects.map((project) => (
            <Box key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: project.color }} />
                <CardContent sx={{ pt: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${project.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderOpen sx={{ color: project.color }} />
                    </Box>
                    <Box>
                      <Tooltip title="Редагувати">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(project); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(project.id); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: 40 }}>
                    {project.description || 'Без опису'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ color: project.color }}>
                    Відкрити задачі
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))
        )}
      </Box>

      {/* Діалог створення/редагування */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth
        sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle>{editProject ? 'Редагувати проєкт' : 'Новий проєкт'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Назва *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            sx={{ mb: 3 }} autoFocus />
          <TextField fullWidth label="Опис" multiline rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5 }}>Колір проєкту</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pb: 1 }}>
            {PROJECT_COLORS.map(color => (
              <Box key={color} onClick={() => setForm(f => ({ ...f, color }))}
                sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: color, cursor: 'pointer',
                  border: form.color === color ? '3px solid #171717' : '3px solid transparent',
                  transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  outline: form.color === color ? '2px solid transparent' : 'none' }} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? <CircularProgress size={20} /> : editProject ? 'Зберегти' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
