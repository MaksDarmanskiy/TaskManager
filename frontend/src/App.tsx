import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Layout from '@/components/layout/Layout';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import TasksPage from '@/pages/TasksPage';
import ProfilePage from '@/pages/ProfilePage';
import AuthPage from '@/pages/AuthPage';

function App() {
  const { authStatus } = useAuthenticator();
  const isAuthenticated = authStatus === 'authenticated';

  if (!isAuthenticated) return <AuthPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/"                element={<DashboardPage />} />
        <Route path="/projects"        element={<ProjectsPage />} />
        <Route path="/projects/:id"    element={<TasksPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
