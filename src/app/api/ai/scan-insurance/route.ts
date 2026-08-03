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
Analyze this uploaded insurance policy document.
Extract the relevant details.
Return ONLY a valid JSON object with EXACTLY these keys (use null or empty string if not found):
{
  "isInsuranceDocument": boolean (true if this document appears to be an insurance policy, false otherwise),
  "provider": "Provider Name (e.g., AIA, SunLife, Pacific Cross, MediTrust)",
  "policyName": "Plan Name (e.g., Silver Care HMO, Infinity Life)",
  "type": "HMO" | "Medical Insurance" | "Life Insurance" | "Critical Illness",
  "policyNumber": "Policy Number or ID",
  "status": "Active" | "Pending" | "Expired",
  "premium": numeric_value_of_premium_amount,
  "paymentFrequency": "Monthly" | "Quarterly" | "Semi-Annual" | "Annual",
  "coverage": numeric_value_of_coverage_limit_or_face_amount,
  "startDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD" (Next premium due date / Renewal date),
  "roomCategory": "Open Ward" | "Semi-Private" | "Private" | "Suite" | "N/A",
  "outpatientLimit": numeric_value_or_null,
  "deductible": numeric_value_or_null,
  "hotline": "Emergency Contact Number",
  "agentName": "Name of Agent/Broker",
  "agentNumber": "Agent Contact Number"
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
                
                if (extractedData.isInsuranceDocument === false) {
                    throw new Error("This doesn't look like an insurance policy document.");
                }
                
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
        console.error("Insurance scan error:", error);
        return NextResponse.json({ error: error.message || 'Failed to scan document' }, { status: 500 });
    }
}
