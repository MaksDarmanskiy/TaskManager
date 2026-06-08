import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';

const AuthWrapper = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #cfe7ff 0%, #ffffff 50%);
  padding: 24px;
`;

const AuthCard = styled(Box)`
  width: 100%;
  max-width: 460px;
`;

const LogoBox = styled(Box)`
  text-align: center;
  margin-bottom: 32px;
`;

export default function AuthPage() {
  return (
    <AuthWrapper>
      <AuthCard>
        <LogoBox>
          <Typography variant="h3" sx={{ color: '#171717', mb: 1 }}>
            TaskManager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Хмарно-орієнтована система управління задачами
          </Typography>
        </LogoBox>
        <Authenticator signUpAttributes={['email']} />
      </AuthCard>
    </AuthWrapper>
  );
}
