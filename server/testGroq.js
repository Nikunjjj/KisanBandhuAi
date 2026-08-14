import { env } from "./src/config/env.js";

async function test(modelName) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.groq.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is this?"
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAAHPAf0t3GvDAAAAAElFTkSuQmCC"
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_completion_tokens: 100
      })
    });

    const data = await response.json();
    console.log(`Model: ${modelName} -> Status:`, response.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test("meta-llama/llama-4-scout-17b-16e-instruct");
