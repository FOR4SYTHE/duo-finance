import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel free tier limit

let recentScans = 0;
const SCAN_LIMIT = 30;

// Track keys that have hit 429 today — skip them on subsequent requests
const exhaustedKeys = new Map<string, number>(); // key -> timestamp when exhausted
const EXHAUSTED_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isKeyExhausted(key: string): boolean {
    const exhaustedAt = exhaustedKeys.get(key);
    if (!exhaustedAt) return false;
    if (Date.now() - exhaustedAt > EXHAUSTED_TTL_MS) {
        exhaustedKeys.delete(key);
        return false;
    }
    return true;
}

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
        process.env.GEMINI_SCANNER_FALLBACK_API_KEY,
        process.env.GEMINI_SCANNER_API_KEY_ALT_PROJECT
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
        return NextResponse.json({ error: 'Gemini API key missing.' }, { status: 500 });
    }

    recentScans++;

    try {
        const body = await req.json();
        const { location } = body;

        if (!location) {
            return NextResponse.json({ error: 'Location missing.' }, { status: 400 });
        }

        const normalizedLocation = location.trim().toLowerCase();

        let lastRateLimitError = '';
        let extractedData = null;

        // Filter out keys already known to be exhausted today
        const availableKeys = apiKeys.filter(k => !isKeyExhausted(k));

        if (availableKeys.length === 0) {
            return NextResponse.json(
                { error: 'All API keys are exhausted for today. Please try again tomorrow.' },
                { status: 429 }
            );
        }

        for (const apiKey of availableKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                const systemPrompt = `
You are an expert local education consultant. Find 3 real-world schools (primary, secondary, or prep) located near or in ${location}.
Provide realistic estimates for the upcoming 2026-2027 school year based on available public data.

Return ONLY a valid JSON array of 3 objects with EXACTLY these keys:
[
  {
    "id": "A unique string ID based on the school name",
    "name": "School Name (e.g. Centro Escolar University Malolos)",
    "type": "School Type (e.g. Private University Prep, Private Catholic)",
    "monthlyTuition": numeric_value_of_estimated_monthly_tuition_in_PHP (e.g. 6000),
    "suppliesPerTerm": numeric_value_of_estimated_supplies_cost_in_PHP (e.g. 3000),
    "chips": ["array", "of", "3_tags"],
    "distance": "distance string if available, omit this key if not"
  }
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

                let text = response.text;
                if (!text) throw new Error("No response from AI");

                // Aggressively clean any markdown formatting that Gemini might sneak in
                text = text.replace(/```json/i, '').replace(/```/g, '').trim();
                
                try {
                    extractedData = JSON.parse(text);
                } catch (parseError) {
                    console.error("Failed to parse Gemini output:", text);
                    throw new Error("AI returned malformed data. Please try again.");
                }
                
                break; // success, exit the api keys loop
            } catch (error: any) {
                const isRateLimit = 
                    error.status === 429 || 
                    error.status === 'RESOURCE_EXHAUSTED' ||
                    error.code === 429 ||
                    (error.error && error.error.code === 429) ||
                    String(error).includes('429') ||
                    String(error).includes('quota') ||
                    String(error).includes('RESOURCE_EXHAUSTED');
                
                if (isRateLimit) {
                    exhaustedKeys.set(apiKey, Date.now());
                    lastRateLimitError = error.message || JSON.stringify(error);
                    continue;
                }
                throw error;
            }
        }

        if (!extractedData) {
            throw new Error(lastRateLimitError || 'All API keys exhausted or rate limited.');
        }

        // Cache the result in Supabase server-side using service_role to bypass RLS
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            
            await supabase
                .from('ai_schools_cache')
                .upsert({
                    location_query: normalizedLocation,
                    data: extractedData,
                    updated_at: new Date().toISOString()
                });
        } else {
            console.warn("Supabase credentials missing, skipping cache save.");
        }

        return NextResponse.json({ data: extractedData });

    } catch (error: any) {
        console.error("Schools AI error:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch schools' }, { status: 500 });
    }
}
