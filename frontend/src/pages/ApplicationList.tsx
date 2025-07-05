import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface Application {
  id: number;
  candidate_name: string;
  candidate_email: string;
  job: {
    id: number;
    title: string;
  };
  total_score: number;
  status: string;
  requirements_met: Record<string, boolean>;
  evaluation_scores: Record<string, { score: number; justification: string }>;
  created_at: string;
}

const ApplicationRow = ({ application }: { application: Application }) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{application.candidate_name}</TableCell>
        <TableCell>{application.candidate_email}</TableCell>
        <TableCell>{application.job.title}</TableCell>
        <TableCell>{application.total_score.toFixed(1)}</TableCell>
        <TableCell>
          <Chip
            label={application.status}
            color={getStatusColor(application.status)}
            size="small"
          />
        </TableCell>
        <TableCell>
          {new Date(application.created_at).toLocaleDateString()}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Evaluation Details
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              {Object.entries(application.requirements_met).map(([req, met]) => (
                <Chip
                  key={req}
                  label={req}
                  color={met ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Question Scores
              </Typography>
              {Object.entries(application.evaluation_scores).map(
                ([question, { score, justification }]) => (
                  <Box key={question} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {question}
                    </Typography>
                    <Typography variant="body1">
                      Score: {score}/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Justification: {justification}
                    </Typography>
                  </Box>
                )
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ApplicationList = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/applications/');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Applications
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ApplicationList; 