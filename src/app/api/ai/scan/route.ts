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

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key missing.' }, { status: 500 });
    }

    recentScans++;

    try {
        const body = await req.json();
        const { image, mimeType } = body;

        if (!image || !mimeType) {
            return NextResponse.json({ error: 'Image data missing.' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
            } catch (err) {
                console.error("Search pipeline error:", err);
                searchError = true;
            }
        } else {
             searchError = true;
        }

        return NextResponse.json({
            item: identifiedItem,
            listings: listings,
            searchError
        });

    } catch (error: any) {
        console.error("Scanner Pipeline Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to process image.' }, 
            { status: 500 }
        );
    }
}
