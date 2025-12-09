/**
 * Chef Marketer - Social Media Content Generator
 * 
 * Generates engaging social media posts for recipes.
 * Saves to `social_posts` table for manual review and posting.
 * 
 * Usage: node scripts/chef_marketer.js [count]
 * Example: node scripts/chef_marketer.js 10
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// Load Keys
const envPath = path.resolve(__dirname, '../.env.local');
const finalEnvPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, '../.env');

let envContent = '';
try {
    envContent = fs.readFileSync(finalEnvPath, 'utf-8');
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=["']?(.*?)["']?$`, 'm'));
    return match ? match[1] : process.env[key];
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL') || parseEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || parseEnv('VITE_SUPABASE_ANON_KEY');
const OPENAI_API_KEY = parseEnv('OPENAI_API_KEY') || parseEnv('VITE_OPENAI_API_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
    console.error("Missing credentials. Check .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const PLATFORMS = ['twitter', 'instagram'];

async function run() {
    const count = parseInt(process.argv[2]) || 5;
    console.log(`📣 Chef Marketer generating ${count} social posts...`);

    // Fetch random recipes that don't have posts yet
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, image, category, prep_time_minutes, cook_time_minutes')
        .order('id', { ascending: true })
        .limit(count * 2); // Extra buffer

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    let generated = 0;

    for (const recipe of recipes) {
        if (generated >= count) break;

        // Check if already has posts
        const { data: existing } = await supabase
            .from('social_posts')
            .select('id')
            .eq('recipe_id', recipe.id)
            .limit(1);

        if (existing && existing.length > 0) {
            continue; // Skip, already has posts
        }

        await generatePosts(recipe);
        generated++;
    }

    console.log(`\n✅ Generated posts for ${generated} recipes.`);
}

async function generatePosts(recipe) {
    console.log(`   📝 Generating for: ${recipe.name}`);

    for (const platform of PLATFORMS) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a social media expert for a Persian food platform called Zaffaron.
                        
Task: Create an engaging ${platform === 'twitter' ? 'tweet (max 280 chars)' : 'Instagram caption (2-3 paragraphs)'} for this Persian recipe.

Recipe: ${recipe.name}
Category: ${recipe.category || 'Persian'}
Prep Time: ${recipe.prep_time_minutes || 30} min
Cook Time: ${recipe.cook_time_minutes || 45} min

Guidelines:
- Be enthusiastic and appetizing
- Include relevant food emojis
- For Twitter: punchy and shareable
- For Instagram: storytelling with call-to-action

OUTPUT JSON:
{
    "content": "The post text",
    "hashtags": ["tag1", "tag2", "tag3"]
}`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content);

            // Save to DB
            const { error: insertError } = await supabase
                .from('social_posts')
                .insert({
                    recipe_id: recipe.id,
                    platform,
                    content: result.content,
                    image_url: recipe.image,
                    hashtags: result.hashtags,
                    status: 'draft'
                });

            if (insertError) {
                console.error(`      ❌ Insert error (${platform}):`, insertError.message);
            } else {
                console.log(`      ✅ ${platform}: saved`);
            }

        } catch (e) {
            console.error(`      ⚠️ AI error (${platform}):`, e.message);
        }
    }
}

run();
