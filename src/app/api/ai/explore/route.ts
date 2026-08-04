import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel free tier limit

let recentScans = 0;
const SCAN_LIMIT = 30;

setInterval(() => {
    recentScans = 0;
}, 1000 * 60 * 60);

export async function POST(req: Request) {
    if (recentScans >= SCAN_LIMIT) {
        return NextResponse.json({ error: 'Hourly scan limit reached.' }, { status: 429 });
    }

    const apiKeys = [
        process.env.GEMINI_CHAT_API_KEY,
        process.env.GEMINI_SCANNER_API_KEY,
        process.env.GEMINI_SCANNER_FALLBACK_API_KEY
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
        return NextResponse.json({ error: 'Gemini API key missing.' }, { status: 500 });
    }

    recentScans++;

    try {
        const body = await req.json();
        const { profile, bookmarkedNames } = body;

        if (!profile) {
            return NextResponse.json({ error: 'Profile data missing.' }, { status: 400 });
        }

        const exclusionRule = Array.isArray(bookmarkedNames) && bookmarkedNames.length > 0 
            ? `\nCRITICAL RULE: The user has already bookmarked the following plans. DO NOT suggest them again under any circumstances: ${bookmarkedNames.join(', ')}`
            : '';

        let lastRateLimitError = '';

        for (const apiKey of apiKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                const systemPrompt = `
You are an expert Philippine insurance broker. Based on the user's profile, recommend exactly 3 real-world insurance products currently available in the Philippines (e.g., from AXA, SunLife, Pacific Cross, Pru Life UK, AIA, Philam, etc.) that best fit their needs.
${exclusionRule}

USER PROFILE:
${JSON.stringify(profile, null, 2)}

Return ONLY a valid JSON array of 3 objects with EXACTLY these keys:
[
  {
    "provider": "Provider Name (e.g., AXA Philippines)",
    "name": "Plan Name (e.g., Health Care Access)",
    "type": "HMO" | "Medical Insurance" | "Life Insurance" | "Critical Illness" | "VUL",
    "description": "A punchy, 1-2 sentence pitch on why this fits them perfectly.",
    "coverage": numeric_value_of_estimated_coverage (e.g. 1500000),
    "premiumEst": numeric_value_of_estimated_monthly_premium (e.g. 4500)
]

CRITICAL: You are configured with Google Search grounding. You MUST return ONLY the raw JSON array. DO NOT append any markdown formatting, explanation text, or citation footnotes (e.g. [1]) outside of the JSON array, as it will break the application's JSON parser.
`;

                const response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt }] }
                    ],
                    config: {
                        temperature: 0.3,
                        responseMimeType: "application/json",
                        tools: [{ googleSearch: {} }],
                    }
                });

                const text = response.text;
                if (!text) throw new Error("No response from AI");

                const extractedData = JSON.parse(text);
                return NextResponse.json(extractedData);

            } catch (error: any) {
                if (error.status === 429) {
                    lastRateLimitError = error.message;
                    continue;
                }
                throw error;
            }
        }

        throw new Error(lastRateLimitError || 'All API keys exhausted or rate limited.');

    } catch (error: any) {
        console.error("Explore AI error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate recommendations' }, { status: 500 });
    }
}
