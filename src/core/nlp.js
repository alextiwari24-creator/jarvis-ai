class NLP {
  constructor(config = {}) {
    this.config = config;
    this.intents = this.initializeIntents();
  }

  /**
   * Initialize intent patterns
   */
  initializeIntents() {
    return {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'greetings'],
        response: 'greeting'
      },
      question: {
        patterns: ['what', 'how', 'why', 'when', 'where', 'who'],
        response: 'question'
      },
      command: {
        patterns: ['do', 'send', 'create', 'delete', 'update', 'execute'],
        response: 'command'
      },
      search: {
        patterns: ['search', 'find', 'look', 'google'],
        response: 'search'
      },
      help: {
        patterns: ['help', 'assist', 'guide', 'support'],
        response: 'help'
      }
    };
  }

  /**
   * Analyze user intent from query
   * @param {string} query - User query
   * @returns {Object} Intent analysis
   */
  async analyzeIntent(query) {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ');

    let detectedIntent = 'general';
    let confidence = 0.5;

    // Check for intent patterns
    for (const [intentType, intentConfig] of Object.entries(this.intents)) {
      const matchCount = intentConfig.patterns.filter(pattern =>
        queryLower.includes(pattern)
      ).length;

      if (matchCount > 0) {
        detectedIntent = intentType;
        confidence = Math.min(0.95, 0.5 + (matchCount * 0.25));
        break;
      }
    }

    return {
      type: detectedIntent,
      confidence,
      keywords: words.filter(w => w.length > 3)
    };
  }

  /**
   * Generate response based on query and intent
   * @param {string} query - User query
   * @param {Object} intent - Intent analysis
   * @returns {Promise<Object>} Generated response
   */
  async generateResponse(query, intent) {
    const responses = {
      greeting: this.handleGreeting(query),
      question: this.handleQuestion(query),
      command: this.handleCommand(query),
      search: this.handleSearch(query),
      help: this.handleHelp(query),
      general: this.handleGeneral(query)
    };

    const responseHandler = responses[intent.type] || responses.general;
    
    return {
      answer: responseHandler,
      intent: intent.type,
      timestamp: new Date()
    };
  }

  /**
   * Handle greeting
   */
  handleGreeting(query) {
    const greetings = [
      "Hello! I'm Jarvis, your AI assistant. How can I help you today?",
      "Greetings! Ready to assist you with any task.",
      "Hi there! What can I do for you?",
      "Welcome! I'm here to help. What do you need?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Handle question
   */
  handleQuestion(query) {
    return `I can help you with that question. Based on your query: "${query}", I would suggest breaking this down into smaller components and researching each part thoroughly.`;
  }

  /**
   * Handle command
   */
  handleCommand(query) {
    return `I'm ready to execute your command. I'll process: "${query}" in the background and keep you updated on the progress.`;
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    return `Searching for information related to: "${query}". I'll compile the most relevant results for you.`;
  }

  /**
   * Handle help request
   */
  handleHelp(query) {
    return `I'm here to help! I can assist you with answering questions, executing tasks in the background, managing your schedule, searching for information, and much more. What specifically do you need help with?`;
  }

  /**
   * Handle general query
   */
  handleGeneral(query) {
    return `Interesting question: "${query}". Let me analyze this and provide you with a comprehensive answer. I can also run background tasks related to this if needed.`;
  }

  /**
   * Extract entities from query
   * @param {string} query - User query
   * @returns {Array} Extracted entities
   */
  extractEntities(query) {
    const entities = [];
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const urlRegex = /https?:\/\/[^\s]+/g;

    const emails = query.match(emailRegex) || [];
    const urls = query.match(urlRegex) || [];

    entities.push(...emails.map(e => ({ type: 'email', value: e })));
    entities.push(...urls.map(u => ({ type: 'url', value: u })));

    return entities;
  }
}

module.exports = NLP;
