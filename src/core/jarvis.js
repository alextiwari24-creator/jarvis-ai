const TaskManager = require('./taskManager');
const NLP = require('./nlp');

class JarvisAI {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.API_KEY,
      model: config.model || 'gpt-4',
      port: config.port || 3000,
      ...config
    };

    this.taskManager = new TaskManager();
    this.nlp = new NLP(this.config);
    this.responseCache = new Map();
  }

  /**
   * Process a user query and return an intelligent response
   * @param {string} query - The user's question or command
   * @returns {Promise<Object>} Response with answer and metadata
   */
  async ask(query) {
    try {
      // Check cache first
      if (this.responseCache.has(query)) {
        return this.responseCache.get(query);
      }

      // Process with NLP
      const intent = await this.nlp.analyzeIntent(query);
      const response = await this.nlp.generateResponse(query, intent);

      // Cache the response
      this.responseCache.set(query, response);

      return {
        query,
        answer: response.answer,
        intent: intent.type,
        confidence: intent.confidence,
        timestamp: new Date(),
        backgroundTasks: []
      };
    } catch (error) {
      console.error('Error in ask():', error);
      return {
        query,
        answer: 'I apologize, but I encountered an error processing your request.',
        error: error.message
      };
    }
  }

  /**
   * Execute a task in the background
   * @param {Object} taskConfig - Configuration for the background task
   * @returns {Promise<Object>} Task execution result
   */
  async executeBackground(taskConfig) {
    try {
      const taskId = await this.taskManager.createTask(taskConfig);
      
      // Run task asynchronously
      this.taskManager.executeTask(taskId, taskConfig).catch(error => {
        console.error(`Task ${taskId} failed:`, error);
      });

      return {
        taskId,
        status: 'queued',
        message: 'Task scheduled for background execution'
      };
    } catch (error) {
      console.error('Error executing background task:', error);
      throw error;
    }
  }

  /**
   * Get the status of a background task
   * @param {string} taskId - The ID of the task
   * @returns {Promise<Object>} Task status and result
   */
  async getTaskStatus(taskId) {
    return this.taskManager.getTaskStatus(taskId);
  }

  /**
   * Get all active tasks
   * @returns {Array} List of active tasks
   */
  getActiveTasks() {
    return this.taskManager.getActiveTasks();
  }

  /**
   * Cancel a background task
   * @param {string} taskId - The ID of the task to cancel
   * @returns {Promise<boolean>} Success status
   */
  async cancelTask(taskId) {
    return this.taskManager.cancelTask(taskId);
  }

  /**
   * Clear response cache
   */
  clearCache() {
    this.responseCache.clear();
  }
}

module.exports = JarvisAI;
