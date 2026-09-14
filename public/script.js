// DOM Elements
const chatBox = document.getElementById('chatBox');
const promptInput = document.getElementById('promptInput');
const promptForm = document.getElementById('promptForm');
const taskPanel = document.getElementById('taskPanel');
const loadingIndicator = document.getElementById('loadingIndicator');

// Conversation history
let conversationHistory = [];

/**
 * Send message to Jarvis
 */
function sendMessage(message) {
  if (!message) return;

  // Update input if message was passed as parameter
  if (typeof message === 'string' && message.trim()) {
    promptInput.value = message;
  }

  handleSubmit({ preventDefault: () => {} });
}

/**
 * Handle form submission
 */
async function handleSubmit(event) {
  event.preventDefault();

  const query = promptInput.value.trim();

  if (!query) return;

  // Add user message to chat
  addMessageToChat(query, 'user');
  promptInput.value = '';

  // Show loading indicator
  showLoading(true);

  try {
    // Send request to server
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Jarvis');
    }

    const data = await response.json();

    // Add Jarvis response to chat
    addMessageToChat(data.answer, 'jarvis', data.intent);

    // Store in history
    conversationHistory.push({
      user: query,
      jarvis: data.answer,
      intent: data.intent,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error:', error);
    addMessageToChat(
      'Sorry, I encountered an error. Please try again.',
      'jarvis'
    );
  } finally {
    showLoading(false);
  }
}

/**
 * Add message to chat box
 */
function addMessageToChat(message, sender, intent = '') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const msgContent = document.createElement('div');
  msgContent.className = 'msg';
  msgContent.textContent = message;

  messageDiv.appendChild(msgContent);

  // Add intent badge for Jarvis messages
  if (sender === 'jarvis' && intent) {
    const intentBadge = document.createElement('div');
    intentBadge.style.fontSize = '0.75em';
    intentBadge.style.opacity = '0.6';
    intentBadge.style.marginTop = '5px';
    intentBadge.textContent = `Intent: ${intent}`;
    messageDiv.appendChild(intentBadge);
  }

  chatBox.appendChild(messageDiv);

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
  loadingIndicator.style.display = show ? 'flex' : 'none';
}

/**
 * Execute background task
 */
async function executeTask() {
  const taskType = document.getElementById('taskType').value;
  let taskConfig = {
    task: taskType
  };

  // Collect task-specific parameters
  if (taskType === 'send_email') {
    const recipient = document.getElementById('recipient').value;
    const subject = document.getElementById('subject').value;

    if (!recipient || !subject) {
      alert('Please fill in all email fields');
      return;
    }

    taskConfig = { ...taskConfig, recipient, subject };
  } else if (taskType === 'web_search') {
    const query = document.getElementById('searchQuery').value;
    if (!query) {
      alert('Please enter a search query');
      return;
    }
    taskConfig = { ...taskConfig, query };
  }

  showLoading(true);

  try {
    const response = await fetch('/api/execute-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskConfig)
    });

    const data = await response.json();

    addMessageToChat(
      `✅ Task scheduled! Task ID: ${data.taskId}\nStatus: ${data.status}`,
      'jarvis'
    );

    closeTaskPanel();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to execute task');
  } finally {
    showLoading(false);
  }
}

/**
 * Show active tasks
 */
async function showActiveTasks() {
  showLoading(true);

  try {
    const response = await fetch('/api/active-tasks');
    const tasks = await response.json();

    if (tasks.length === 0) {
      addMessageToChat(
        '📋 No active tasks at the moment.',
        'jarvis'
      );
    } else {
      let taskList = '📋 Active Tasks:\n\n';
      tasks.forEach((task, index) => {
        taskList += `${index + 1}. Task ID: ${task.id}\n   Type: ${task.type}\n   Status: ${task.status}\n\n`;
      });
      addMessageToChat(taskList, 'jarvis');
    }
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('Failed to fetch active tasks', 'jarvis');
  } finally {
    showLoading(false);
  }
}

/**
 * Show task panel modal
 */
function showTaskPanel() {
  taskPanel.style.display = 'flex';
}

/**
 * Close task panel modal
 */
function closeTaskPanel() {
  taskPanel.style.display = 'none';
}

/**
 * Clear chat history
 */
function clearChat() {
  chatBox.innerHTML = '';
  conversationHistory = [];

  // Show welcome message again
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'welcome-message';
  welcomeDiv.innerHTML = `
    <h2>Welcome to Jarvis AI</h2>
    <p>I'm your intelligent assistant. Ask me anything or give me commands!</p>
    <div class="suggestion-buttons">
      <button class="suggestion" onclick="sendMessage('Hello!')">Hello!</button>
      <button class="suggestion" onclick="sendMessage('What can you do?')">What can you do?</button>
      <button class="suggestion" onclick="sendMessage('Help me')">Help me</button>
    </div>
  `;
  chatBox.appendChild(welcomeDiv);

  addMessageToChat('Chat cleared! Ready to start fresh. 🚀', 'jarvis');
}

/**
 * Handle task type change in modal
 */
document.addEventListener('DOMContentLoaded', function() {
  const taskTypeSelect = document.getElementById('taskType');
  
  if (taskTypeSelect) {
    taskTypeSelect.addEventListener('change', function() {
      // Hide all fields
      document.getElementById('emailFields').style.display = 'none';
      document.getElementById('searchFields').style.display = 'none';

      // Show relevant fields
      if (this.value === 'send_email') {
        document.getElementById('emailFields').style.display = 'block';
      } else if (this.value === 'web_search') {
        document.getElementById('searchFields').style.display = 'block';
      }
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === taskPanel) {
      closeTaskPanel();
    }
  });

  // Focus on input
  promptInput.focus();
});

// Allow Enter key to send message
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && event.target === promptInput) {
    event.preventDefault();
    handleSubmit(event);
  }
});
