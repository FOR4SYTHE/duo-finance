import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
        const { query } = body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid query.' }, { status: 400 });
        }

        const prompt = `
You are a financial planning AI assisting with a relocation to the Philippines.
The user is asking for cost estimates for the area: "${query}".

Return realistic monthly baseline estimates in Philippine Pesos (PHP) for this area.
If the area doesn't exist or is too vague, return an error in JSON like {"error": "no estimate available for this area yet"}.

If the area is valid, return ONLY a valid JSON object with EXACTLY these numeric keys:
{
  "baseRent": number, // Base rent for 1 adult
  "rentPerExtraAdult": number, // Additional rent per extra adult
  "baseUtilities": number, // Base utilities for 1 adult
  "utilPerExtraAdult": number, // Additional utilities per extra adult
  "baseFood": number, // Base groceries/food for 1 adult
  "foodPerExtraAdult": number,
  "kidFoodMultiplier": number, // e.g. 0.5 for half an adult's food
  "baseMisc": number, // Other misc expenses for 1 adult
  "miscPerExtraAdult": number,
  "depositMonths": number, // Standard security deposit months (e.g. 1 or 2)
  "advanceRentMonths": number, // Standard advance rent months (e.g. 1)
  "starterFurniture": number // Lump sum for basic starter furniture
}
Do not include markdown backticks around the JSON.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) {
             throw new Error("No response text from Gemini");
        }

        const estimate = JSON.parse(text);
        if (estimate.error) {
            return NextResponse.json({ error: estimate.error }, { status: 404 });
        }

        return NextResponse.json(estimate);
    } catch (error: any) {
        console.error("AI Area Estimate Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to estimate area.' }, 
            { status: 500 }
        );
    }
}
