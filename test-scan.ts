import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

async function test() {
    const braveApiKey = "BSA3TJwhRQWRPaZx64wDmZ6ZotM6C_X";
    const queryTerm = "HANABISHI Air Fryer";
    const searchQuery = encodeURIComponent(`buy ${queryTerm} Philippines price Lazada Shopee`);
    
    console.log("1. Calling Brave API with query:", queryTerm);
    const braveRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${searchQuery}&count=10`, {
        headers: {
            "Accept": "application/json",
            "X-Subscription-Token": braveApiKey
        }
    });

    if (!braveRes.ok) {
        console.error("Brave API failed:", braveRes.status, await braveRes.text());
        return;
    }

    const braveData = await braveRes.json();
    const searchResults = braveData.web?.results?.map((r: any) => ({
        title: r.title,
        description: r.description,
        url: r.url
    })) || [];
    console.log(`Brave API returned ${searchResults.length} results.`);

    if (searchResults.length === 0) {
        console.log("No results from brave.");
        return;
    }

    console.log("2. Calling Gemini to extract listings...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const ai = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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

    try {
        const listingResponse = await ai.generateContent({
            contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
            }
        });
        console.log("Gemini succeeded! Response:", listingResponse.response.text());
    } catch (e: any) {
        console.error("Gemini failed:", e.message);
    }
}

test();
