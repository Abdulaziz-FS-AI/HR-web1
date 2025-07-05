import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/Navbar';
import JobList from './pages/JobList';
import JobCreate from './pages/JobCreate';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationList from './pages/ApplicationList';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/jobs/create" element={<JobCreate />} />
            <Route path="/apply/:jobId" element={<ApplicationForm />} />
            <Route path="/applications" element={<ApplicationList />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 