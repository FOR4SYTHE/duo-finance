import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
    if (!process.env.GEMINI_CHAT_API_KEY) {
        return new Response(JSON.stringify({ error: 'Gemini API key missing.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.json();
        const { messages, householdContext } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Invalid messages format.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_CHAT_API_KEY });
        
        const systemPrompt = `You are Duo AI, a friendly and knowledgeable household finance assistant for a couple (one Filipino, one South African) living in the Philippines. You help with budgeting questions, spending advice, and local cost-of-living insights. Always show amounts in both ₱PHP and RZAR when discussing money. Be concise, warm, and practical. 

Here is their current household snapshot:
${householdContext}
`;

        // The new Google Gen AI SDK expects format: [{role, parts: [{text: "..."}]}]
        const formattedMessages = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const resultStream = await ai.models.generateContentStream({
            model: 'gemini-3.6-flash',
            contents: formattedMessages,
            config: { 
                temperature: 0.7,
                systemInstruction: systemPrompt 
            }
        });

        // Set up streaming response using SSE format
        const encoder = new TextEncoder();
        
        return new Response(
            new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of resultStream) {
                            if (chunk.text) {
                                // Important: We structure this as an SSE payload
                                const payload = JSON.stringify({ text: chunk.text });
                                controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                            }
                        }
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (streamError) {
                        console.error('Error while streaming:', streamError);
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                        controller.close();
                    }
                }
            }),
            { 
                headers: { 
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive'
                } 
            }
        );

    } catch (error: any) {
        console.error("Chat API Error:", error);
        let errorMsg = error.message || 'Failed to process chat request.';
        if (errorMsg.includes('GenerateRequestsPerDay')) {
            errorMsg = "DUO AI has reached its daily free-tier capacity! Please check back tomorrow to chat more.";
        } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota')) {
            errorMsg = "DUO AI's brain is taking a quick breather (API Limit Reached). Please wait a minute and try again.";
        } else if (errorMsg.includes('{"error"')) {
            try {
                const parsed = JSON.parse(errorMsg);
                errorMsg = parsed.error?.message || "An unexpected error occurred.";
            } catch (e) {}
        }
        
        return new Response(
            JSON.stringify({ error: errorMsg }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
