import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ALLOWED_COLORS = [
    '#30D158', // Sage/Green
    '#E8A33D', // Warm Amber
    '#0A84FF', // Dusty Blue
    '#FF453A', // Muted Rose/Red
    '#BF5AF2'  // Soft Lavender/Purple
];

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'Gemini API key is missing from environment.' }, 
            { status: 500 }
        );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const body = await req.json();
        const { currentCategories } = body;

        const prompt = `
You are a financial advisor for a couple relocating to the Philippines.
They are setting up their household budget.

Their current budget categories are:
${currentCategories?.map((c: any) => c.name).join(', ') || 'None'}

Suggest 3 to 4 additional relevant household budget categories that they might have forgotten.
For each category, provide:
1. "name": The category name (e.g. "Transportation", "Insurance", etc.)
2. "icon": A valid Lucide-react icon name (e.g. "Car", "Shield", "Wifi", "Popcorn"). Must be PascalCase.
3. "color": Exactly one of these exact hex codes, choosing the one that fits best: ${ALLOWED_COLORS.join(', ')}

Return ONLY a valid JSON array of objects with the keys "name", "icon", and "color". Do not include markdown formatting or backticks around the JSON.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        });

        const text = response.text();
        if (!text) {
             throw new Error("No response text from Gemini");
        }

        const suggestions = JSON.parse(text);
        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("AI Suggestion Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate AI suggestions.' }, 
            { status: 500 }
        );
    }
}
