import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Tooltip, useMediaQuery, useTheme as useMuiTheme,
} from '@mui/material';
import {
  Dashboard, FolderOpen, Person, Menu as MenuIcon,
  TaskAlt, Logout, ChevronLeft,
} from '@mui/icons-material';
import styled from 'styled-components';
import GlobalSearch from '../GlobalSearch';
const DRAWER_WIDTH = 180;

const navItems = [
  { label: 'Дашборд',  icon: <Dashboard />,   path: '/' },
  { label: 'Проєкти',  icon: <FolderOpen />,   path: '/projects' },
  { label: 'Профіль',  icon: <Person />,        path: '/profile' },
];

const Logo = styled(Typography)`
  color: #171717;
  font-weight: 600 !important;
`;

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthenticator();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const drawerOpen = isMobile ? !open : open;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" elevation={0} sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Logo variant="h6">TaskManager</Logo>
          <Box sx={{ flexGrow: 1 }} />
          <GlobalSearch />
          <Box sx={{ width: 16 }} />
          <Tooltip title={user?.signInDetails?.loginId || 'Профіль'}>
            <Avatar sx={{ bgcolor: '#171717', width: 36, height: 36, cursor: 'pointer', fontSize: 14 }}
              onClick={() => navigate('/profile')}>
              {(user?.signInDetails?.loginId || 'U')[0].toUpperCase()}
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', top: '64px', height: 'calc(100% - 64px)' },
        }}
      >
        <List sx={{ px: 1, pt: 2 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: active ? '#f0f0f3' : 'transparent',
                    border: '1px solid transparent',
                    '&:hover': { backgroundColor: '#f5f5f7' },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? '#171717' : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} sx={{ color: active ? '#171717' : 'text.primary', '& .MuiTypography-root': { fontWeight: active ? 600 : 400 } }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItemButton onClick={signOut} sx={{ borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'rgba(244,63,94,0.1)' } }}>
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}><Logout /></ListItemIcon>
            <ListItemText primary="Вийти" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: 3,
        mt: '64px',
        ml: open && !isMobile ? `${DRAWER_WIDTH}px` : 0,
        transition: 'margin 0.3s ease',
        minHeight: 'calc(100vh - 64px)',
        overflowX: 'hidden'
      }}>
        {children}
      </Box>
    </Box>
  );
}
