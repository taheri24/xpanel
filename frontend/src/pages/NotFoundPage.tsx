import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from '@tanstack/react-router';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Go Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
