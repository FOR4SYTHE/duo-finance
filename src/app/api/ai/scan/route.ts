import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel free tier limit

// Soft rate limit state (in-memory, per instance)
let recentScans = 0;
const SCAN_LIMIT = 30;

// Reset limit hourly
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

        // Try each API key in sequence
        for (const apiKey of apiKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                // STEP 1: Vision Identification
                const visionPrompt = `
Identify this product or item. 
Return ONLY a valid JSON object with EXACTLY these keys:
{
  "name": "Generic item name (e.g. Cooking Oil)",
  "brand": "Brand name if visible, or null",
  "category": "Broad category (e.g. Groceries)",
  "description": "Short 1-sentence description"
}
Do not use markdown formatting around the JSON.
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

                const identifiedItem = JSON.parse(visionText);
                
                // STEP 2: Price Search via Brave API
                const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
                let listings: any[] = [];
                let searchError = false;

                if (braveApiKey) {
                    const queryTerm = `${identifiedItem.brand || ''} ${identifiedItem.name}`.trim();
                    const searchQuery = encodeURIComponent(`buy ${queryTerm} Philippines price Lazada Shopee`);
                    
                    try {
                        const braveRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${searchQuery}&count=10`, {
                            headers: {
                                "Accept": "application/json",
                                "X-Subscription-Token": braveApiKey
                            }
                        });

                        if (braveRes.ok) {
                            const braveData = await braveRes.json();
                            const searchResults = braveData.web?.results?.map((r: any) => ({
                                title: r.title,
                                description: r.description,
                                url: r.url
                            })) || [];

                            if (searchResults.length > 0) {
                                // STEP 3: Structure Listings with Gemini
                                const extractionPrompt = `
Analyze these search results for product listings of "${queryTerm}" in the Philippines.
Extract realistic product listings.
Return ONLY a valid JSON array of objects. No markdown.
Structure each object exactly like this:
{
  "name": "Full product title",
  "price_php": number (extracted price in PHP),
  "source": "Platform name (e.g. Lazada, Shopee, SM Markets)",
  "url": "the original URL",
  "description": "Short relevant snippet"
}

Search Results:
${JSON.stringify(searchResults)}
`;
                                const listingResponse = await ai.models.generateContent({
                                    model: 'gemini-3.6-flash',
                                    contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
                                    config: {
                                        temperature: 0.1,
                                        responseMimeType: "application/json",
                                    }
                                });

                                const listingText = listingResponse.text;
                                if (listingText) {
                                    listings = JSON.parse(listingText);
                                }
                            }
                        } else {
                            searchError = true;
                        }
                    } catch (err: any) {
                        console.error("Search pipeline error:", err);
                        const errMsg = err?.message || '';
                        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota') || errMsg.includes('GenerateRequestsPerDay')) {
                            throw err; // Throw to the outer loop to trigger fallback
                        }
                        searchError = true;
                    }
                } else {
                     searchError = true;
                }

                // If successful, return immediately and exit the loop
                return NextResponse.json({
                    item: identifiedItem,
                    listings: listings,
                    searchError
                });

            } catch (err: any) {
                const errorMsg = err.message || '';
                if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota') || errorMsg.includes('GenerateRequestsPerDay')) {
                    console.warn("Scanner Pipeline: Hit rate limit on key, failing over...");
                    lastRateLimitError = errorMsg;
                    continue; // Try the next key
                } else {
                    throw err; // Rethrow if it's not a rate limit issue
                }
            }
        }

        // If we exhausted all API keys (the loop finished without returning)
        if (lastRateLimitError) {
            throw new Error(lastRateLimitError);
        } else {
            throw new Error("Failed to connect to AI across all available keys.");
        }

    } catch (error: any) {
        console.error("Scanner Pipeline Error:", error);
        
        let errorMsg = error.message || 'Failed to process image.';
        if (errorMsg.includes('GenerateRequestsPerDay')) {
            errorMsg = "DUO AI has reached its daily free-tier capacity! Please check back tomorrow to scan more items.";
        } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota')) {
            errorMsg = "DUO AI is currently resting. (Free tier limit reached). Please try again in a minute.";
        } else if (errorMsg.includes('{"error"')) {
            try {
                const parsed = JSON.parse(errorMsg);
                errorMsg = parsed.error?.message || "An unexpected error occurred.";
            } catch (e) {}
        }
        
        return NextResponse.json(
            { error: errorMsg }, 
            { status: 500 }
        );
    }
}
