require('dotenv').config();
const JarvisAI = require('./core/jarvis');

/**
 * Initialize and demonstrate Jarvis AI
 */
async function main() {
  console.log('🤖 Initializing Jarvis AI...\n');

  const jarvis = new JarvisAI({
    apiKey: process.env.API_KEY,
    model: process.env.MODEL || 'gpt-4'
  });

  try {
    // Example 1: Simple greeting
    console.log('📝 Example 1: Greeting');
    const greeting = await jarvis.ask('Hello Jarvis!');
    console.log('User: Hello Jarvis!');
    console.log(`Jarvis: ${greeting.answer}\n`);

    // Example 2: Question
    console.log('📝 Example 2: Question');
    const question = await jarvis.ask('How does machine learning work?');
    console.log('User: How does machine learning work?');
    console.log(`Jarvis: ${question.answer}`);
    console.log(`Intent: ${question.intent}\n`);

    // Example 3: Background task
    console.log('📝 Example 3: Background Task');
    const taskResult = await jarvis.executeBackground({
      task: 'send_email',
      recipient: 'user@example.com',
      subject: 'Project Update'
    });
    console.log(`Task scheduled: ${taskResult.taskId}`);
    console.log(`Status: ${taskResult.status}\n`);

    // Example 4: Check task status
    console.log('📝 Example 4: Task Status');
    setTimeout(async () => {
      const status = await jarvis.getTaskStatus(taskResult.taskId);
      console.log('Task Status:', status);
    }, 2000);

    // Example 5: Search request
    console.log('📝 Example 5: Search Request');
    const search = await jarvis.ask('Search for information about AI');
    console.log('User: Search for information about AI');
    console.log(`Jarvis: ${search.answer}\n`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { main };
