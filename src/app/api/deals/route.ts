import { NextResponse } from "next/server";

export const revalidate = 43200; // Cache for 12 hours (43200 seconds) to save API limits

export async function GET() {
  try {
    const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!braveApiKey || !geminiApiKey) {
      console.warn("API keys missing, returning fallback deals.");
      return NextResponse.json({ deals: getFallbackDeals() });
    }

    // 1. Fetch search results from Brave API
    const searchQuery = encodeURIComponent("promo codes discounts Philippines Foodpanda Grab Shopee Lazada Klook Agoda Cheapflights 2026");
    const braveRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${searchQuery}&count=15`, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": braveApiKey
      }
    });

    if (!braveRes.ok) {
      console.error("Brave API Error:", await braveRes.text());
      return NextResponse.json({ deals: getFallbackDeals() });
    }

    const braveData = await braveRes.json();
    const searchResults = braveData.web?.results?.map((r: any) => ({
      title: r.title,
      description: r.description,
      url: r.url
    })) || [];

    // 2. Ask Gemini to extract structured deals
    const prompt = `
      Analyze the following search results for promo codes and discounts in the Philippines.
      Extract the best, most realistic promo codes specifically for these brands: Foodpanda, Grab, Shopee, Lazada, Klook, Agoda, Cheapflights.
      
      Respond STRICTLY with a valid JSON array of objects. No markdown formatting, no backticks, just the JSON array.
      
      Each object must match this structure:
      {
        "id": "unique-string",
        "brand": "Brand Name from list above",
        "title": "Short title (e.g. ₱100 off delivery)",
        "code": "PROMOCODE (or 'CLICK TO APPLY' if no explicit code)",
        "expires": "ISO date string for expiration (estimate around end of month if not stated)",
        "category": "Food/Transport/Shopping/Travel",
        "hot": true/false (true if it seems like a very good deal),
        "url": "the original URL where this deal was found"
      }
      
      Search Results:
      ${JSON.stringify(searchResults)}
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!geminiRes.ok) {
      console.error("Gemini API Error:", await geminiRes.text());
      return NextResponse.json({ deals: getFallbackDeals() });
    }

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates[0]?.content?.parts[0]?.text;
    
    if (!rawJson) {
      return NextResponse.json({ deals: getFallbackDeals() });
    }

    let parsedDeals = [];
    try {
      parsedDeals = JSON.parse(rawJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", rawJson);
      return NextResponse.json({ deals: getFallbackDeals() });
    }

    return NextResponse.json({ deals: parsedDeals });

  } catch (error) {
    console.error("Deals API Error:", error);
    return NextResponse.json({ deals: getFallbackDeals() });
  }
}

// Fallback data if API limits are hit or network fails
function getFallbackDeals() {
  return [
    {
      id: "deal_1",
      brand: "Foodpanda",
      title: "₱100 off on minimum spend ₱499",
      code: "PANDANEW",
      expires: "2026-07-31T23:59:59Z",
      category: "Food",
      hot: true,
      url: "https://www.foodpanda.ph"
    },
    {
      id: "deal_2",
      brand: "Grab",
      title: "20% off GrabCar (max ₱80)",
      code: "GRABRIDES",
      expires: "2026-07-25T23:59:59Z",
      category: "Transport",
      hot: false,
      url: "https://www.grab.com/ph"
    },
    {
      id: "deal_3",
      brand: "Shopee",
      title: "Free Shipping Vouchers",
      code: "FREESHIP199",
      expires: "2026-07-31T23:59:59Z",
      category: "Shopping",
      hot: true,
      url: "https://shopee.ph"
    }
  ];
}
