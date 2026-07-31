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
        
        const systemPrompt = `You are Duo AI, a friendly and knowledgeable household finance assistant for a couple (one Filipino, one South African) living in the Philippines. You help with budgeting questions, spending advice, and local cost-of-living insights. Always show amounts in both ₱PHP and RZAR when discussing money. Be concise, warm, and practical. 

CRITICAL GREETING RULE: Do NOT always say "Mabuhay & howzit!". Keep your greetings natural, completely random, and varied every time. Sometimes use a Filipino greeting (e.g., "Kumusta", "Magandang araw"), sometimes a South African English/Afrikaans greeting (e.g., "Howzit", "Goeiedag", "Awe"), sometimes just a standard English greeting, or sometimes just jump straight into the answer without a greeting at all!

Here is their current household snapshot:
${householdContext}
`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_CHAT_API_KEY });
        
        // The new Google Gen AI SDK expects format: [{role, parts: [{text: "..."}]}]
        const formattedMessages = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        let resultStream: any = null;
        let useGroqFallback = false;

        try {
            resultStream = await ai.models.generateContentStream({
                model: 'gemini-3.6-flash',
                contents: formattedMessages,
                config: { 
                    temperature: 0.7,
                    systemInstruction: systemPrompt 
                }
            });
        } catch (error: any) {
            console.warn("Gemini Chat API Error - checking for fallback...", error.message);
            const errorMsg = error.message || '';
            if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota') || errorMsg.includes('GenerateRequestsPerDay')) {
                useGroqFallback = true;
            } else {
                throw error;
            }
        }

        const encoder = new TextEncoder();

        // GROQ FALLBACK
        if (useGroqFallback && process.env.GROQ_API_KEY) {
            const groqMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                }))
            ];
            
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: groqMessages,
                    stream: true,
                    temperature: 0.7
                })
            });

            if (!groqResponse.ok) {
                const groqErr = await groqResponse.text();
                throw new Error('Groq Fallback API Error: ' + groqErr);
            }

            return new Response(
                new ReadableStream({
                    async start(controller) {
                        try {
                            const reader = groqResponse.body?.getReader();
                            if (!reader) throw new Error('No readable stream from Groq');
                            
                            const decoder = new TextDecoder('utf-8');
                            let buffer = '';

                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || '';

                                for (const line of lines) {
                                    if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                                        try {
                                            const data = JSON.parse(line.slice(6));
                                            const content = data.choices?.[0]?.delta?.content;
                                            if (content) {
                                                const payload = JSON.stringify({ text: content });
                                                controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                                            }
                                        } catch (e) {}
                                    }
                                }
                            }
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            controller.close();
                        } catch (streamError) {
                            console.error('Error while streaming Groq:', streamError);
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
        } else if (useGroqFallback && !process.env.GROQ_API_KEY) {
            // Re-throw original error if Groq is not configured
            throw new Error("DUO AI has reached its daily free-tier capacity! Please check back tomorrow to chat more. (Groq fallback not configured).");
        }

        // ORIGINAL GEMINI STREAM
        return new Response(
            new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of resultStream) {
                            if (chunk.text) {
                                const payload = JSON.stringify({ text: chunk.text });
                                controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                            }
                        }
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (streamError) {
                        console.error('Error while streaming Gemini:', streamError);
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
