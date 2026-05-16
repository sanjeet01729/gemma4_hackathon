// src/api/gemma.ts

// ✅ Replace with your Colab ngrok URL from the terminal output
const API_BASE = 'https://drone-mooing-civil.ngrok-free.dev';

export const askGemma = async (
  prompt: string,
  language: string,
  subject: string
): Promise<string> => {

  // Build a prompt that includes language and subject instructions
  const fullPrompt = `${
    language === 'hindi'
      ? 'हिंदी में उत्तर दें। सरल भाषा में।'
      : 'Answer in simple English.'
  }\nSubject: ${subject}\n\nQuestion: ${prompt}`;

  const res = await fetch(`${API_BASE}/ask-llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // ← required for ngrok
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      role: 'teacher',        // uses your teacher system prompt
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

  const data = await res.json();
  return data.response;       // ← matches your PromptResponse model
};