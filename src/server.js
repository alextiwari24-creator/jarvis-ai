const express = require('express');
const path = require('path');
require('dotenv').config();
const JarvisAI = require('./core/jarvis');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Jarvis AI
const jarvis = new JarvisAI({
  apiKey: process.env.API_KEY,
  model: process.env.MODEL || 'gpt-4'
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API endpoint to ask Jarvis a question
app.post('/api/ask', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Query cannot be empty'
      });
    }

    const response = await jarvis.ask(query);
    res.json(response);
  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({
      error: 'An error occurred processing your request',
      message: error.message
    });
  }
});

// API endpoint to execute background task
app.post('/api/execute-task', async (req, res) => {
  try {
    const { task, ...config } = req.body;

    const result = await jarvis.executeBackground({
      task,
      ...config
    });

    res.json(result);
  } catch (error) {
    console.error('Error in /api/execute-task:', error);
    res.status(500).json({
      error: 'Failed to execute task',
      message: error.message
    });
  }
});

// API endpoint to get task status
app.get('/api/task-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await jarvis.getTaskStatus(taskId);
    res.json(status);
  } catch (error) {
    console.error('Error in /api/task-status:', error);
    res.status(500).json({
      error: 'Failed to get task status',
      message: error.message
    });
  }
});

// API endpoint to get active tasks
app.get('/api/active-tasks', (req, res) => {
  try {
    const tasks = jarvis.getActiveTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error in /api/active-tasks:', error);
    res.status(500).json({
      error: 'Failed to get active tasks',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Jarvis AI Server running at http://localhost:${PORT}`);
  console.log(`📝 Open your browser and visit http://localhost:${PORT}`);
});
