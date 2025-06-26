import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in your environment variables.');
}

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash',
  temperature: 0.7,
});

const systemTemplate = 'You are a trivia bot. Provide a fun fact or trivia question about the topic: {topic}';

const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['user', 'Please share a fun fact or trivia question.'],
]);

async function run() {
  const topic = 'space exploration';

  const promptValue = await promptTemplate.invoke({ topic });

  const response = await model.invoke(promptValue);

  console.log(`Trivia about ${topic}:`);
  console.log(response.content);
}

run();
