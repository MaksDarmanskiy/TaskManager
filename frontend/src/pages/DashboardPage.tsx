import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, PlayCircle, Warning, FolderOpen, TaskAlt } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getStats } from '@/api';
import type { DashboardStats } from '@/types';
import styled from 'styled-components';

const StatCard = styled(Card)<{ accent?: string }>`
  position: relative;
  overflow: hidden;
  border-top: 3px solid ${({ accent }) => accent || '#171717'} !important;
`;

const COLORS = ['#999999', '#0d74ce', '#16a34a'];
const PRIORITY_COLORS = ['#16a34a', '#ab6400', '#eb8e90'];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  if (isLoading) return <LinearProgress />;
  if (!stats) return null;

  const statusData = [
    { name: 'Todo',        value: stats.byStatus.todo,        icon: <RadioButtonUnchecked /> },
    { name: 'In Progress', value: stats.byStatus.in_progress, icon: <PlayCircle /> },
    { name: 'Done',        value: stats.byStatus.done,        icon: <CheckCircle /> },
  ];

  const pieData = statusData.map(s => ({ name: s.name, value: s.value }));

  const priorityData = [
    { name: 'Низький', value: stats.byPriority.low },
    { name: 'Середній', value: stats.byPriority.medium },
    { name: 'Високий', value: stats.byPriority.high },
  ];

  // Динамічно збираємо кольори проєктів користувача
  const customColors = stats.projectStats.map(p => p.color).filter(Boolean);
  const fallbackColors = ['#999999', '#0d74ce', '#16a34a', '#ab6400', '#eb8e90', '#7b61ff'];

  // Функція для отримання масиву кольорів
  const getChartColors = (count: number, offset = 0) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const colorIndex = (i + offset) % customColors.length;
      colors.push(customColors[colorIndex] || fallbackColors[(i + offset) % fallbackColors.length]);
    }
    return colors;
  };

  const STATUS_COLORS = getChartColors(statusData.length, 0);
  const PRIORITY_COLORS = getChartColors(priorityData.length, statusData.length);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Дашборд</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Загальна статистика твоїх проєктів та задач
      </Typography>

      {/* Статистичні картки */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[
          { label: 'Проєктів', value: stats.totalProjects, icon: <FolderOpen />, accent: '#171717', color: '#171717' },
          { label: 'Задач всього', value: stats.totalTasks, icon: <TaskAlt />, accent: '#0d74ce', color: '#0d74ce' },
          { label: 'Виконано', value: stats.byStatus.done, icon: <CheckCircle />, accent: '#16a34a', color: '#16a34a' },
          { label: 'Прострочено', value: stats.overdue, icon: <Warning />, accent: '#eb8e90', color: '#eb8e90' },
        ].map((item) => (
          <StatCard accent={item.accent} key={item.label}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: item.color }}>{item.value}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{item.label}</Typography>
                  </Box>
                  <Box sx={{ color: item.color, opacity: 0.7 }}>{item.icon}</Box>
                </Box>
              </CardContent>
            </StatCard>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3 }}>
        {/* Pie chart — статуси */}
        <Box>
          <Card sx={{ height: 300 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Задачі по статусах</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #f0f0f3', borderRadius: 8, color: '#171717', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Bar chart — пріоритети */}
        <Box>
          <Card sx={{ height: 300 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Задачі по пріоритетах</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f3" />
                  <XAxis dataKey="name" tick={{ fill: '#60646c', fontSize: 12 }} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#60646c', fontSize: 12 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #f0f0f3', borderRadius: 8, color: '#171717', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityData.map((_, i) => <Cell key={i} fill={PRIORITY_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Проєкти з прогресом */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Прогрес по проєктах</Typography>
              {stats.projectStats.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>Ще немає проєктів</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {stats.projectStats.map((p) => {
                    const progress = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                    return (
                      <Box key={p.id} sx={{
                        p: 2, 
                        border: '1px solid #f0f0f3', 
                        borderRadius: 2, 
                        bgcolor: '#fafafa',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#ffffff', borderColor: '#dcdee0', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color || '#171717' }} />
                            <Typography variant="body2" noWrap title={p.title} sx={{ fontWeight: 600, maxWidth: 150 }}>
                              {p.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: p.color || '#171717' }}>
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress}
                          sx={{ height: 6, borderRadius: 3, bgcolor: '#e6e6e6',
                            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: p.color || '#171717' } }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {p.done} з {p.total} задач виконано
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
