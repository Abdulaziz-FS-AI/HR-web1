import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

interface Application {
  id: number;
  applicant_name: string;
  score: number;
  feedback: string;
  passed: boolean;
}

interface JobDetails {
  id: number;
  title: string;
  requirements: {
    education: string[];
    experience: string[];
    skills: string[];
  };
  threshold_score: number;
  total_applications: number;
}

const JobResults: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/test`);
        if (response.ok) {
          const data = await response.json();
          setJobDetails(data.job);
          setApplications(data.applications);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    if (jobId) {
      fetchResults();
    }
  }, [jobId]);

  if (!jobDetails) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {jobDetails.title} - Results
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Job Requirements
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Education"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {jobDetails.requirements.education.map((edu, index) => (
                      <Chip key={index} label={edu} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                }
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Experience"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {jobDetails.requirements.experience.map((exp, index) => (
                      <Chip key={index} label={exp} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                }
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Skills"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {jobDetails.requirements.skills.map((skill, index) => (
                      <Chip key={index} label={skill} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Applications ({jobDetails.total_applications})
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Threshold Score: {jobDetails.threshold_score} points
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.applicant_name}</TableCell>
                    <TableCell>{app.score}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.passed ? 'Passed' : 'Failed'}
                        color={app.passed ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{app.feedback}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default JobResults; 