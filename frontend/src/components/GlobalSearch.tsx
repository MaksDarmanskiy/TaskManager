import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Dialog, InputBase, Typography, List, ListItemButton, ListItemText, CircularProgress, Chip } from '@mui/material';
import { Search, Assignment, FolderOpen } from '@mui/icons-material';
import { getProjects, getTasks } from '@/api';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    const projects = await getProjects();
    const tasksArrays = await Promise.all(projects.map(p => getTasks(p.id).catch(() => [])));
    const tasks = tasksArrays.flat();
    return { projects, tasks };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['globalSearch'],
    queryFn: fetchAllData,
    enabled: open,
    staleTime: 60000,
  });

  // Artificial delay to show loader
  useEffect(() => {
    if (!query) {
      setIsSearching(false);
      setDebouncedQuery('');
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 1500); // 1.5 seconds loader

    return () => clearTimeout(timer);
  }, [query]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  };

  const handleSelectResult = (res: any) => {
    if (res.type === 'task') {
      navigate(`/projects/${res.item.projectId}`, { state: { editTaskId: res.item.id } });
    } else {
      navigate(`/projects/${res.item.id}`);
    }
    handleClose();
  };

  const searchResults = () => {
    if (!data || !debouncedQuery.trim()) return [];
    
    const q = debouncedQuery.toLowerCase();
    const matchedProjects = data.projects.filter(p => p.title.toLowerCase().includes(q));
    const matchedTasks = data.tasks.filter(t => t.title.toLowerCase().includes(q));

    return [
      ...matchedProjects.map(p => ({ type: 'project', item: p })),
      ...matchedTasks.map(t => {
        const project = data.projects.find(p => p.id === t.projectId);
        return { type: 'task', item: t, projectName: project?.title || 'Невідомий проєкт' };
      })
    ].slice(0, 10); // Limit to 10 results
  };

  const results = searchResults();

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, 
          bgcolor: '#fafafa', border: '1px solid #f0f0f3', 
          borderRadius: 2, px: 2, py: 1, cursor: 'pointer',
          width: { xs: 40, sm: 200 },
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#f0f0f3' }
        }}
      >
        <Search fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Пошук задач...
        </Typography>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, position: 'absolute', top: '10%' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 3, borderBottom: '1px solid #f0f0f3' }}>
          <Search sx={{ color: 'text.secondary', mr: 2 }} fontSize="medium" />
          <InputBase
            fullWidth
            autoFocus
            placeholder="Знайти задачу або проєкт..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ py: 2.5, fontSize: '1.1rem' }}
          />
        </Box>
        
        <Box sx={{ minHeight: 100, maxHeight: 400, overflowY: 'auto', px: 3, py: 2 }}>
          {(isLoading || isSearching) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!(isLoading || isSearching) && debouncedQuery && results.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Нічого не знайдено
            </Typography>
          )}

          {!(isLoading || isSearching) && results.length > 0 && (
            <List>
              {results.map((res, i) => (
                <ListItemButton 
                  key={i} 
                  onClick={() => handleSelectResult(res)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <Box sx={{ mr: 2, color: 'text.secondary' }}>
                    {res.type === 'project' ? <FolderOpen /> : <Assignment />}
                  </Box>
                  <ListItemText 
                    primary={res.item.title} 
                    secondary={res.type === 'task' ? `Проєкт: ${(res as any).projectName}` : 'Перейти до проєкту'} 
                    primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                  />
                  <Chip size="small" label={res.type === 'project' ? 'Проєкт' : 'Задача'} sx={{ ml: 2, bgcolor: '#f0f0f3' }} />
                </ListItemButton>
              ))}
            </List>
          )}

          {!(isLoading || isSearching) && !debouncedQuery && (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }} variant="body2">
              Почніть вводити текст для пошуку
            </Typography>
          )}
        </Box>
      </Dialog>
    </>
  );
}
