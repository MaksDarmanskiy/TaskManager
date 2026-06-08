import { Box, Card, CardContent, Typography, Avatar, Button, Divider } from '@mui/material';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Person, Email, VpnKey } from '@mui/icons-material';

export default function ProfilePage() {
  const { user, signOut } = useAuthenticator();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Профіль</Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid #f0f0f3', boxShadow: 'none' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: '#171717', color: '#fff', fontSize: 40 }}>
              {(user?.signInDetails?.loginId || 'U')[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Користувач</Typography>
              <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Email fontSize="small" />
                {user?.signInDetails?.loginId}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#f0f0f3' }} />

          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Деталі акаунту</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VpnKey color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">User ID (Cognito)</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', mt: 0.5 }}>{user?.userId}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Button variant="outlined" color="error" fullWidth onClick={signOut} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Вийти з акаунту
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
