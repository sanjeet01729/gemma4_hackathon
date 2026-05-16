
// src/api/gemma.ts

const API_BASE = 'https://drone-mooing-civil.ngrok-free.dev';

const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

// ── Text only ────────────────────────────────────────────────────────────────
export const askGemma = async (
  prompt: string,
  language: string,
  subject: string
): Promise<string> => {
  const fullPrompt = buildPrompt(prompt, language, subject);

  const res = await fetch(`${API_BASE}/ask-llm`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      prompt:      fullPrompt,
      role:        'teacher',
      temperature: 0.3,
      max_tokens:  256, // shorter = faster response
    }),
  });

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  const data = await res.json();
  return data.response;
};

// ── Text + image (vision) ────────────────────────────────────────────────────
export const askGemmaWithImage = async (
  prompt: string,
  language: string,
  subject: string,
  imageBase64: string
): Promise<string> => {
  const fullPrompt = buildPrompt(prompt, language, subject);

  const res = await fetch(`${API_BASE}/ask-llm`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      prompt:      fullPrompt,
      role:        'teacher',
      temperature: 0.3,
      max_tokens:  512, // more tokens for image analysis
      image:       imageBase64, // base64 string, no data:image prefix needed
    }),
  });

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  const data = await res.json();
  return data.response;
};

// ── Shared prompt builder ────────────────────────────────────────────────────
function buildPrompt(prompt: string, language: string, subject: string): string {
  const langInstruction = language === 'hindi'
    ? 'हिंदी में उत्तर दें। सरल भाषा में। 5 लाइन से ज़्यादा नहीं।'
    : 'Answer in simple English. Maximum 5 lines. No markdown.';

  return `${langInstruction}\nSubject: ${subject}\n\nQuestion: ${prompt}`;
}

