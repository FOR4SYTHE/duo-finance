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
        process.env.GEMINI_SCANNER_API_KEY,
        process.env.GEMINI_SCANNER_FALLBACK_API_KEY
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
        return NextResponse.json({ error: 'Gemini API key missing.' }, { status: 500 });
    }

    recentScans++;

    try {
        const body = await req.json();
        const { image, mimeType } = body;

        if (!image || !mimeType) {
            return NextResponse.json({ error: 'Image data missing.' }, { status: 400 });
        }

        let lastRateLimitError = '';

        for (const apiKey of apiKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                const visionPrompt = `
Analyze this uploaded document.
Determine its category from these options: 'receipt', 'warranty', 'visa', 'other'.
Extract the title/store name, date, total amount (if applicable, in PHP), and 2-3 relevant tags.
Return ONLY a valid JSON object with EXACTLY these keys:
{
  "title": "Store name or document title",
  "category": "receipt" | "warranty" | "visa" | "other",
  "date": "YYYY-MM-DD",
  "amount": numeric_value_or_null,
  "tags": ["tag1", "tag2"]
}
`;

                const visionResponse = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: visionPrompt },
                                { inlineData: { data: image, mimeType } }
                            ]
                        }
                    ],
                    config: {
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    }
                });

                const visionText = visionResponse.text;
                if (!visionText) throw new Error("No response from Vision");

                const extractedData = JSON.parse(visionText);
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
        console.error("Document scan error:", error);
        return NextResponse.json({ error: error.message || 'Failed to scan document' }, { status: 500 });
    }
}
