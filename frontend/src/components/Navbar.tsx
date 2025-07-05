import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          HR AI Platform
        </Typography>
        <Button color="inherit" component={Link} to="/">Jobs</Button>
        <Button color="inherit" component={Link} to="/jobs/create">Create Job</Button>
        <Button color="inherit" component={Link} to="/apply">Apply</Button>
        <Button color="inherit" component={Link} to="/applications">Applications</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 