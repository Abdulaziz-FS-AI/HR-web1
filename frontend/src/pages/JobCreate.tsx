import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const JobCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirement, setRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [thresholdScore, setThresholdScore] = useState('7.0');

  const addRequirement = () => {
    if (requirement.trim()) {
      setRequirements([...requirements, requirement.trim()]);
      setRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (question.trim()) {
      setQuestions([...questions, question.trim()]);
      setQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          evaluation_questions: questions,
          threshold_score: parseFloat(thresholdScore),
        }),
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Error creating job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Job Position
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            margin="normal"
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
              <IconButton onClick={addRequirement} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
            <List>
              {requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText primary={req} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeRequirement(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evaluation Questions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <IconButton onClick={addQuestion} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
            <List>
              {questions.map((q, index) => (
                <ListItem key={index}>
                  <ListItemText primary={q} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeQuestion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <TextField
            fullWidth
            label="Threshold Score (0-10)"
            type="number"
            value={thresholdScore}
            onChange={(e) => setThresholdScore(e.target.value)}
            required
            margin="normal"
            inputProps={{ min: "0", max: "10", step: "0.1" }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
            >
              Create Job
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              size="large"
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default JobCreate; 