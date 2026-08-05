const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) process.env[key] = values.join('=').trim();
});

const { GoogleGenAI } = require('@google/genai');

async function main() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_SCANNER_API_KEY_ALT_PROJECT });

    const systemPrompt = "Test prompt for insurance";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] }
            ],
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
            }
        });
        console.log("Success:", response.text);
    } catch (error) {
        console.error("API Error:", error);
    }
}

main();
