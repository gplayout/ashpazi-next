import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Force dynamic rendering (don't try to build statically)
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Lazy initialization - only runs when endpoint is called
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are Chef Judge, an expert culinary critic for Zaffaron, a Persian cuisine platform.

Your task is to rate a user's home-cooked dish photo. Be encouraging but honest.

Evaluate based on:
1. Plating and presentation (30%)
2. Color balance and visual appeal (30%)
3. Portion and composition (20%)
4. Overall appetizing factor (20%)

OUTPUT JSON:
{
    "score": <number 1-10>,
    "feedback": "2-3 sentences about the dish's presentation",
    "tips": ["tip1", "tip2"] or [],
    "encouragement": "A motivating closing statement"
}`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "low"
                            }
                        },
                        {
                            type: "text",
                            text: "Please rate this dish."
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const result = JSON.parse(response.choices[0].message.content);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Judge API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}

