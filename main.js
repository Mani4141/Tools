import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { tool } from "@langchain/core/tools";
import { z } from "zod";


if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in your environment variables.');
}

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash',
  temperature: 0.7,
});

const multiply = tool(
  ({ a, b }) => {
    /**
     * Multiply two numbers.
     */
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
const modelWithTools = model.bindTools([multiply]);

// Run tool in a conversation
const run = async () => {
  console.log("=== Example: Multiply Tool with Gemini ===");

  const response = await modelWithTools.invoke([
    new HumanMessage("What is 15 multiplied by 23?")
  ]);

  console.log("AI Response:", response.content);
  console.log("Tool Calls:", response.tool_calls);
};

run();