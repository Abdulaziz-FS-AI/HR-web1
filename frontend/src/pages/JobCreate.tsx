import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

interface Requirement {
  type: 'education' | 'experience' | 'skills';
  details: string;
}

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState({ type: 'education', details: '' });
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddRequirement = () => {
    if (newRequirement.details.trim()) {
      setRequirements([...requirements, { ...newRequirement }]);
      setNewRequirement({ type: 'education', details: '' });
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const calculateThresholdScore = () => {
    return questions.length * 10;
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          requirements,
          questions,
        }),
      });

      if (response.ok) {
        navigate('/jobs');
      } else {
        console.error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Job Position
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newRequirement.type}
                onChange={(e) => setNewRequirement({ ...newRequirement, type: e.target.value as 'education' | 'experience' | 'skills' })}
              >
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
                <MenuItem value="skills">Skills</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Requirement Details"
              value={newRequirement.details}
              onChange={(e) => setNewRequirement({ ...newRequirement, details: e.target.value })}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddRequirement}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <List>
          {requirements.map((req, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${req.type}: ${req.details}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveRequirement(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Evaluation Questions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="New Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddQuestion}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>

        <List>
          {questions.map((question, index) => (
            <ListItem key={index}>
              <ListItemText primary={question} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveQuestion(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            Threshold Score (automatically calculated): {calculateThresholdScore()} points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on {questions.length} questions × 10 points each
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/jobs')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!title || !description || requirements.length === 0 || questions.length === 0}
          >
            Create Job
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default JobCreate; 