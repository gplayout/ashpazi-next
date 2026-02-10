import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface TranslationInput {
    source_instructions: string[];
    ingredients_context: string[];
    source_title: string;
    targetLanguage?: string;
    recipe_id?: string;
}

/**
 * Extracts all integers from a string.
 * @param {string} text
 * @returns {number[]} Sorte list of integers found
 */
function extractNumbers(text: string): number[] {
    if (!text) return [];
    // Helper to normalize FA digits to EN
    const faToEn = (s: string): string =>
        s.replace(/[۰-۹]/g, (d: string) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    const normalized = faToEn(text);
    const matches = normalized.match(/\d+/g);
    return matches ? matches.map(Number).sort((a, b) => a - b) : [];
}

export class TranslationAgent {
    /**
     * Translates a recipe to the Target Language.
     * @param {object} input
     * @param {string} input.recipe_id
     * @param {string} input.source_title
     * @param {string[]} input.source_instructions
     * @param {string[]} input.ingredients_context (Do not translate, just for context)
     * @param {string} input.targetLanguage (e.g. 'en', 'fr', 'de', 'ar')
     * @returns {Promise<object>} { title, instructions: [{step, text, metadata}] }
     */
    static async translate(input: TranslationInput): Promise<Record<string, unknown>> {
        if (!input.source_instructions || !Array.isArray(input.source_instructions)) {
            throw new Error('Invalid input: source_instructions must be an array');
        }

        const targetLang = input.targetLanguage || 'en';
        const isEnglish = targetLang === 'en';

        // Language Name Map for clear prompting
        const langNames: Record<string, string> = {
            en: 'English',
            fr: 'French',
            de: 'German',
            es: 'Spanish',
            ar: 'Arabic',
            ja: 'Japanese',
            zh: 'Chinese (Simplified)',
            fa: 'Persian (Farsi)',
            it: 'Italian',
            ru: 'Russian',
        };
        const langName = langNames[targetLang] || targetLang;

        const prompt = `
You are "Chef Zaffaron", a world-renowned Persian Chef with a charming, warm, and expert personality. 
Your mission is to share the secrets of Persian cuisine with the world, remastering humble recipes into 5-star culinary experiences.

CONTEXT (Ingredients):
${input.ingredients_context.join('\n')}

SOURCE TITLE: ${input.source_title}

SOURCE INSTRUCTIONS:
${input.source_instructions.map((line, i) => `${i + 1}. ${line}`).join('\n')}

YOUR RULES:
1. OUTPUT JSON ONLY.
2. Structure: { 
"title": "...", 
"ingredients": ["..."],
"instructions": [ { "step": 1, "text": "...", "metadata": {} }, ... ] 
}
3. CULINARY REMASTERING: 
- If instructions are vague (e.g., "cook until done"), use your expertise to specify technique and time (e.g., "Simmer gently for 45 mins until tender").
- Use appetizing, sensory language (sizzle, aroma, golden-brown).
478. THE "CHEF ZAFFARON" SIGNATURE (Psychology: Subtle & Premium):
- Saffron is your royal signature, but it must be EXCLUSIVE. Do NOT force it into every dish.
- Only suggest it if it truly elevates the flavor (e.g., Rice, Desserts, Chicken).
- If used, frame it as a "Royal Upgrade" or "Golden Touch" (Optional), never mandatory.
- We want users to crave the saffron touch, not be annoyed by it.
6. CONTENT RICHNESS:
- "Origin & History": Write a MAGNETIZING mini-story. Focus on cultural romance, nostalgia, or the "Why" behind the dish. NOT just facts—make it emotional and evocative.
- "Why This Version": Sell this specific recipe.
- "Sensory Experience": Poetic description of texture/aroma (e.g., "Melt-in-your-mouth," "Crunchy finish").
- "Chef's Guide": 1 Pro Tip, 1 Common Mistake, 1 Storage Tip.
7. RULES FOR SCORING & NUTRITION (CRITICAL):
- Nutrition: ESTIMATE scientifically based on ingredients. Be realistic.
- Internal Score (1-100):
  - Health: High for veggies/stews, Low for fried/sugary.
  - Taste: High for complex stews (Ghormeh Sabzi = 98), Low for plain rice (= 50).
  - Marketing Joy: How "Instagrammable" or fun is it? 
8. DATA MAXIMIZATION RULES:
- **SEO**: Think like a Google Expert. Use high-volume keywords.
- **Social**: Be witty, viral, and engaging.
- **Flavor Profile**: Be objective. Estimate the intensity on a 0-10 scale.
- **Tags**: Be exhaustive. EXPLICITLY check for: [Gluten-Free, Keto, Vegan, Vegetarian, Dairy-Free, Low-Carb, Paleo, Halal, Nut-Free].
9. TARGET LANGUAGE: ${langName}.
10. TAGS & METADATA RULES (STRICT):
- TAGS MUST BE IN ENGLISH ONLY. NO FARSI CHARACTERS.
- "Smart Branding":
  - For TRADITIONAL dishes (Ghormeh Sabzi, Fesenjan), use "Persian", "Iranian".
  - For INTERNATIONAL/FUSION dishes (Pasta, Macaroni, Pizza), DO NOT use "Persian" or "Iranian" in the title. Instead use: "Golden", "Royal", "Silk Road", "Aromatic", "Chef Zaffaron's".
  - We want a global, premium feel, not "Persian Pasta".
`;

        try {
            // Using Gemini 3.0 Flash Preview (New per user request)
            const model = genAI.getGenerativeModel({
                model: 'gemini-3-flash-preview',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING },
                            category: {
                                type: SchemaType.STRING,
                                description:
                                    "A clean, high-level English category (e.g. 'Stew', 'Rice Dish', 'Appetizer', 'Pasta').",
                            },
                            // 1. SMART TAGS & METADATA
                            dietary_tags: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'e.g. Gluten-Free, Vegan, Keto, Halal',
                            },
                            occasion_tags: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'e.g. Dinner Party, weeknight',
                            },
                            seasonality: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'e.g. Summer, Winter',
                            },
                            difficulty_level: {
                                type: SchemaType.STRING,
                                description: 'Beginner, Intermediate, Advanced, Master',
                            },

                            // 2. INGREDIENT INTELLIGENCE
                            ingredient_substitutions: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        ingredient: { type: SchemaType.STRING },
                                        substitute: { type: SchemaType.STRING },
                                        note: { type: SchemaType.STRING },
                                    },
                                    required: ['ingredient', 'substitute'],
                                },
                            },

                            // 3. EQUIPMENT
                            equipment_needed: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                            },

                            // 4. FLAVOR RADAR
                            flavor_profile: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    savory: { type: SchemaType.INTEGER, description: '0-10' },
                                    spicy: { type: SchemaType.INTEGER, description: '0-10' },
                                    sweet: { type: SchemaType.INTEGER, description: '0-10' },
                                    sour: { type: SchemaType.INTEGER, description: '0-10' },
                                    salty: { type: SchemaType.INTEGER, description: '0-10' },
                                    bitter: { type: SchemaType.INTEGER, description: '0-10' },
                                },
                                required: ['savory', 'spicy', 'sweet', 'sour', 'salty', 'bitter'],
                            },

                            // 5. PAIRINGS
                            pairings: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    beverage: { type: SchemaType.STRING },
                                    side_dish: { type: SchemaType.STRING },
                                },
                                required: ['beverage', 'side_dish'],
                            },

                            // 6. ECONOMY
                            estimated_cost: {
                                type: SchemaType.STRING,
                                description: '$, $$, or $$$',
                            },

                            // 7. SEO & GROWTH
                            seo_keywords: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'Top 5-10 high traffic keywords',
                            },
                            seo_meta_description: {
                                type: SchemaType.STRING,
                                description: 'Google-optimized <160 char description',
                            },
                            social_share_copy: {
                                type: SchemaType.STRING,
                                description: 'Viral, witty hook for social media',
                            },

                            // 8. TRUST & SAFETY
                            allergen_contains: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'Common allergens: Soy, Eggs, Nuts, etc.',
                            },
                            kid_friendly: { type: SchemaType.BOOLEAN },

                            // 9. HEALTH & WELLNESS (New for Frontend Box)
                            health_benefits: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description:
                                    '3-4 short, scientifically accurate health benefits of this dish.',
                            },

                            // RICH CONTENT FIELDS (Keep existing)
                            origin_history: {
                                type: SchemaType.STRING,
                                description:
                                    "Write a short, engaging origin story (2-3 sentences max). Focus on cultural context and why it's special. Be charming but grounded, not overly poetic.",
                            },
                            why_this_version: {
                                type: SchemaType.STRING,
                                description:
                                    "One sentence on why this specific recipe is superior (e.g. 'Uses saffron bloomed in ice').",
                            },
                            sensory_experience: {
                                type: SchemaType.STRING,
                                description:
                                    "Briefly describe the taste and texture (e.g. 'Crispy bottom with fluffy aromatic rice'). Keep it appetizing but realistic.",
                            },
                            chef_guide: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    pro_tip: { type: SchemaType.STRING },
                                    common_mistake: { type: SchemaType.STRING },
                                    storage: { type: SchemaType.STRING },
                                },
                                required: ['pro_tip', 'common_mistake', 'storage'],
                            },
                            ingredients: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                            },
                            instructions: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        step: { type: SchemaType.INTEGER },
                                        text: { type: SchemaType.STRING },
                                        metadata: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                derived_duration_min: { type: SchemaType.INTEGER },
                                            },
                                        },
                                    },
                                    required: ['step', 'text', 'metadata'],
                                },
                            },
                            // New Extended Fields
                            nutrition: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    calories_per_serving: { type: SchemaType.INTEGER },
                                    protein_g: { type: SchemaType.INTEGER },
                                    carbs_g: { type: SchemaType.INTEGER },
                                    fat_g: { type: SchemaType.INTEGER },
                                },
                                required: ['calories_per_serving', 'protein_g', 'carbs_g', 'fat_g'],
                            },
                            internal_score: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    health_score: {
                                        type: SchemaType.INTEGER,
                                        description: '1-100 score based on nutritional balance',
                                    },
                                    taste_score: {
                                        type: SchemaType.INTEGER,
                                        description:
                                            '1-100 score based on flavor complexity and popularity',
                                    },
                                    difficulty_score: {
                                        type: SchemaType.INTEGER,
                                        description: '1-100 (1=easy, 100=hard)',
                                    },
                                    marketing_joy_score: {
                                        type: SchemaType.INTEGER,
                                        description: '1-100 how fun/exciting this dish is to eat',
                                    },
                                },
                                required: [
                                    'health_score',
                                    'taste_score',
                                    'difficulty_score',
                                    'marketing_joy_score',
                                ],
                            },
                            marketing_description: {
                                type: SchemaType.STRING,
                                description: 'A punchy, capitalized 1-liner selling the dish.',
                            },
                        },
                        required: [
                            'title',
                            'category',
                            'ingredients',
                            'instructions',
                            'nutrition',
                            'internal_score',
                            'marketing_description',
                            'origin_history',
                            'why_this_version',
                            'sensory_experience',
                            'chef_guide',
                            'dietary_tags',
                            'occasion_tags',
                            'difficulty_level',
                            'ingredient_substitutions',
                            'equipment_needed',
                            'flavor_profile',
                            'pairings',
                            'estimated_cost',
                            'seo_keywords',
                            'seo_meta_description',
                            'social_share_copy',
                            'allergen_contains',
                            'kid_friendly',
                            'health_benefits',
                        ],
                    },
                },
            });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText) throw new Error('Empty response from Gemini');

            let finalResult: Record<string, unknown>;
            try {
                finalResult = JSON.parse(responseText);
            } catch (e) {
                // Sometimes Gemini wraps in ```json ... ``` despite mimeType, though rare with responseSchema.
                // Cleaning just in case.
                const cleaned = responseText
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                finalResult = JSON.parse(cleaned);
            }

            // --- VALIDATION LAYER ---

            // Normalize result (Gemini usually adheres to schema strictness better than GPT-JSON mode)
            if (!finalResult.title || !Array.isArray(finalResult.instructions)) {
                throw new Error('Invalid structure: missing title or instructions array');
            }

            // 1b. STRICT TAG CLEANING (Regex Filter)
            // Removes any strings containing Farsi/Arabic characters from tags
            const hasNonEnglish = (str: string): boolean => /[^\x00-\x7F]/.test(str);

            if (finalResult.dietary_tags) {
                finalResult.dietary_tags = (finalResult.dietary_tags as string[]).filter(
                    t => !hasNonEnglish(t)
                );
            }
            if (finalResult.occasion_tags) {
                finalResult.occasion_tags = (finalResult.occasion_tags as string[]).filter(
                    t => !hasNonEnglish(t)
                );
            }
            if (finalResult.health_benefits) {
                // For health benefits, we might want to keep translated text if target is FA,
                // but if target is EN, we strictly enforce it.
                if (isEnglish) {
                    finalResult.health_benefits = (finalResult.health_benefits as string[]).filter(
                        t => !hasNonEnglish(t)
                    );
                }
            }

            // 2. Numeric Integrity Check (Strict for English, Soft for others)
            if (isEnglish) {
                const sourceText = input.source_instructions.join(' ');
                const outText = (finalResult.instructions as { text: string }[])
                    .map(s => s.text)
                    .join(' ');

                const sourceNums = extractNumbers(sourceText);
                const outNums = extractNumbers(outText);

                const outNumsCopy = [...outNums];
                const missingNums: number[] = [];

                for (const num of sourceNums) {
                    const idx = outNumsCopy.indexOf(num);
                    if (idx !== -1) {
                        outNumsCopy.splice(idx, 1); // consume match
                    } else {
                        missingNums.push(num);
                    }
                }

                if (missingNums.length > 0) {
                    console.warn(
                        `[TranslationAgent] Numeric Mismatch in ${input.recipe_id}: Missing ${missingNums.join(', ')}`
                    );
                }
            }

            // Length check
            if (
                (finalResult.instructions as unknown[]).length <
                input.source_instructions.length / 2
            ) {
                console.warn(
                    '[TranslationAgent] Note: Step count significantly reduced (condensed instructions).'
                );
                // throw new Error("Suspiciously low number of steps compared to source.");
            }

            return finalResult;
        } catch (err) {
            console.error('Translation ERROR (Gemini):', err);
            throw err;
        }
    }
}
