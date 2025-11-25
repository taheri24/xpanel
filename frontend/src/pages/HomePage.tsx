import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to xpanel
      </Typography>
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          This is a full-stack application built with:
        </Typography>
        <Typography variant="body1" component="ul">
          <li>Backend: Go 1.25 with Gin framework</li>
          <li>Frontend: React with TypeScript and Vite</li>
          <li>UI Library: Material-UI (MUI)</li>
          <li>Router: TanStack Router</li>
          <li>Testing: Vitest</li>
          <li>Component Development: Storybook</li>
        </Typography>
      </Paper>
    </Box>
  );
};

export default HomePage;
