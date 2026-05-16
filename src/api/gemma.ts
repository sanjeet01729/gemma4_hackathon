// src/api/gemma.ts

const API_BASE = 'https://drone-mooing-civil.ngrok-free.dev';

const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

// Subjects that need longer answers
const DETAILED_SUBJECTS = ['maths', 'science', 'economy'];


function createTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}
// ── Text only ────────────────────────────────────────────────────────────────
export const askGemma = async (
  prompt: string,
  language: string,
  subject: string
): Promise<string> => {
  const fullPrompt = buildPrompt(prompt, language, subject);
  const max_tokens = DETAILED_SUBJECTS.includes(subject) ? 768 : 400;

  // retry once on failure or empty response
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/ask-llm`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          prompt,
          role:        'teacher',
          temperature: 0.3,
          max_tokens,
          // pass language and subject separately so backend can use them
          language,
          subject,
        }),
       signal: createTimeout(90000), // 90 seconds
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();

      // if response is empty retry once
      if (!data.response || data.response.trim().length < 3) {
        if (attempt === 0) continue;
        return language === 'hindi'
          ? 'उत्तर नहीं मिला। कृपया दोबारा पूछें।'
          : 'No answer received. Please try again.';
      }

      return data.response;

    } catch (e) {
      if (attempt === 1) {
        // both attempts failed
        return language === 'hindi'
          ? 'उत्तर देने में समय लग रहा है। दोबारा पूछें।'
          : 'Taking too long. Please ask again.';
      }
    }
  }

  return language === 'hindi'
    ? 'कुछ गड़बड़ हो गई। दोबारा कोशिश करें।'
    : 'Something went wrong. Please try again.';
};

// ── Text + image (vision) ────────────────────────────────────────────────────
export const askGemmaWithImage = async (
  prompt: string,
  language: string,
  subject: string,
  imageBase64: string
): Promise<string> => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/ask-llm`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          prompt,
          role:        'teacher',
          temperature: 0.3,
          max_tokens:  768,
          language,
          subject,
          image: imageBase64,
        }),
        signal: createTimeout(120000), // 2 mins for image — takes longer
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();

      if (!data.response || data.response.trim().length < 3) {
        if (attempt === 0) continue;
        return language === 'hindi'
          ? 'फोटो का उत्तर नहीं मिला। दोबारा कोशिश करें।'
          : 'Could not read image. Please try again.';
      }

      return data.response;

    } catch (e) {
      if (attempt === 1) {
        return language === 'hindi'
          ? 'फोटो भेजने में दिक्कत हुई। दोबारा कोशिश करें।'
          : 'Image upload failed. Please try again.';
      }
    }
  }

  return language === 'hindi'
    ? 'कुछ गड़बड़ हो गई।'
    : 'Something went wrong.';
};

// ── Shared prompt builder ────────────────────────────────────────────────────
function buildPrompt(prompt: string, language: string, subject: string): string {
  const langInstruction = language === 'hindi'
    ? 'हिंदी में उत्तर दें। सरल और स्पष्ट भाषा में।'
    : 'Answer in simple and clear English.';

  const subjectInstruction = DETAILED_SUBJECTS.includes(subject)
    ? (language === 'hindi'
        ? 'गणित/विज्ञान के लिए सभी steps दिखाएं।'
        : 'For maths/science show all steps clearly.')
    : '';

  return `${langInstruction} ${subjectInstruction}\nSubject: ${subject}\n\nQuestion: ${prompt}`;
}