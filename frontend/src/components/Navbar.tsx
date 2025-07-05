import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          HR AI Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Jobs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/jobs/create"
          >
            Create Job
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/applications"
          >
            Applications
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 