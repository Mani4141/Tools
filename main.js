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
    console.log(`multiply tool called with a = ${a}, b = ${b}`);
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

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Tool: Get current weather from Open-Meteo
const getWeather = tool(
  async ({ latitude, longitude }) => {
    console.log(`getWeather tool called with latitude = ${latitude}, longitude = ${longitude}`);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();
    const tempC = data.current_weather?.temperature;

    if (tempC === undefined) {
      return "Sorry, could not get the temperature at that location.";
    }

    const tempF = (tempC * 9/5) + 32;
    return `The current temperature is ${tempC.toFixed(1)}°C (${tempF.toFixed(1)}°F)`;
  },
  {
    name: "getWeather",
    description: "Get current temperature for a given location (latitude and longitude)",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }
);

const modelWithTools = model.bindTools([multiply, getWeather]);


const run = async () => {
  console.log("=== Example: Tool Usage with Gemini ===");

  // Example 1: Multiply
  const response1 = await modelWithTools.invoke("What is 15 multiplied by 23?");

  if (response1.tool_calls && response1.tool_calls.length > 0) {
    const toolCall = response1.tool_calls[0];
    if (toolCall.name === "multiply") {
      const result = await multiply.invoke(toolCall.args);
      console.log("Multiply result:", result);
    }
  }

  // Example 2: Weather
  const response2 = await modelWithTools.invoke("What's the current temperature at latitude 36.9741 and longitude -122.0288?");

  if (response2.tool_calls && response2.tool_calls.length > 0) {
    const toolCall = response2.tool_calls[0];
    if (toolCall.name === "getWeather") {
      const result = await getWeather.invoke(toolCall.args);
      console.log("Weather result:", result, "(Santa Cruz)");
    }
  }
};

run();