import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
}

const PrivacyNotice = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md">
    <DialogTitle>Privacy Notice - AI-Powered Resume Evaluation</DialogTitle>
    <DialogContent>
      <Typography paragraph>
        We use artificial intelligence (AI) technology to assist in evaluating job applications. 
        Please read this privacy notice carefully to understand how we process your data.
      </Typography>

      <Typography variant="h6" gutterBottom>Data Processing:</Typography>
      <Typography paragraph>
        1. Your resume will be processed by AI technology (OpenAI's GPT-4) to evaluate your qualifications.
        2. The evaluation includes matching your skills with job requirements and scoring relevant experience.
        3. Personal data from your resume will be transmitted to our AI service provider (OpenAI).
      </Typography>

      <Typography variant="h6" gutterBottom>Data Protection:</Typography>
      <Typography paragraph>
        1. We implement security measures to protect your personal information.
        2. Your data is encrypted during transmission and storage.
        3. Access to your information is restricted to authorized personnel only.
      </Typography>

      <Typography variant="h6" gutterBottom>Your Rights:</Typography>
      <Typography paragraph>
        1. You can request access to your personal data.
        2. You can request deletion of your data.
        3. You can opt out of AI-powered evaluation (manual review will be conducted).
      </Typography>

      <Typography paragraph>
        For any privacy-related concerns, please contact our data protection officer.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const ApplicationForm = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: null as File | null,
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        setError('Job not found');
      }
    } catch (error) {
      setError('Error fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setError('Please accept the privacy notice to proceed');
      return;
    }
    if (!formData.resume) {
      setError('Please upload your resume');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formPayload = new FormData();
    formPayload.append('candidate_name', formData.name);
    formPayload.append('candidate_email', formData.email);
    formPayload.append('resume', formData.resume);
    formPayload.append('job_id', jobId as string);

    try {
      const response = await fetch('http://localhost:8000/api/applications/', {
        method: 'POST',
        body: formPayload,
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error submitting application');
      }
    } catch (error) {
      setError('Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Apply for {job?.title}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Job Description
        </Typography>
        <Typography paragraph>{job?.description}</Typography>

        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <ul>
          {job?.requirements.map((req, index) => (
            <li key={index}>
              <Typography>{req}</Typography>
            </li>
          ))}
        </ul>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="resume-file"
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resume: e.target.files ? e.target.files[0] : null,
                })
              }
            />
            <label htmlFor="resume-file">
              <Button variant="outlined" component="span">
                Upload Resume
              </Button>
            </label>
            {formData.resume && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {formData.resume.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I have read and accept the{' '}
                  <Button
                    variant="text"
                    onClick={() => setShowPrivacyDialog(true)}
                    sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}
                  >
                    privacy notice
                  </Button>{' '}
                  regarding AI-powered resume evaluation
                </Typography>
              }
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={submitting || !privacyAccepted}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              size="large"
              disabled={submitting}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>

      <PrivacyNotice
        open={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
      />
    </Container>
  );
};

export default ApplicationForm; 