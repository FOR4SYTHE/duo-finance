import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel free tier limit

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_SCANNER_API_KEY_ALT_PROJECT;

    if (!apiKey) {
        return NextResponse.json({ error: 'Gemini Alt API key missing.' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { airline, flightNumber, origin, destination, date, layover, connectingFlightNumber } = body;

        // --- MOCK TEST INJECTION ---
        if (flightNumber === 'TEST1234' || flightNumber === 'test1234') {
            const mockStatuses = ["Boarding (Mock)", "Departed (Mock)", "In Air (Mock)", "Landed (Mock)"];
            const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
            return NextResponse.json({
                gate: "A15",
                seat: "TBD",
                terminal: "T3",
                status: randomStatus,
                flightDuration: "14h 20m"
            });
        }
        // ---------------------------

        if (!airline || !flightNumber || !date) {
            return NextResponse.json({ error: 'Flight details missing.' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const searchPrompt = `
Search for the live, real-time flight status of ${airline} flight ${flightNumber} (${origin} to ${destination}) on ${date}.
${layover ? `This journey includes a layover in ${layover}. ${connectingFlightNumber ? `The connecting flight is ${connectingFlightNumber}.` : ''} Identify which leg is currently active or upcoming, and report the status for THAT specific active leg.` : ''}
Find the most up-to-date departure gate, terminal, and status (e.g., Scheduled, On Time, Delayed, Boarding, Departed, Cancelled).
If the flight is tomorrow or in the future and gates aren't assigned yet, set gate to "TBD" and status to "Upcoming".
If it's in the air, set status to "In Air" or "Departed".

Return ONLY a valid JSON object with exactly these keys:
{
  "gate": "Gate string or TBD",
  "seat": "TBD",
  "terminal": "Terminal string or TBD",
  "status": "String (e.g., Upcoming, On Time, Delayed, Boarding, Departed, Cancelled)",
  "flightDuration": "e.g. 14h 20m or Unknown"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: searchPrompt }]
                }
            ],
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }] // Enable Google Search Grounding
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");

        const extractedData = JSON.parse(text);
        return NextResponse.json(extractedData);

    } catch (error: any) {
        console.error("Flight tracking error:", error);
        return NextResponse.json({ error: error.message || 'Failed to track flight' }, { status: 500 });
    }
}
