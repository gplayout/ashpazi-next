/**
 * Chef Blogger - SEO Article Generator
 * 
 * Generates long-form SEO blog posts about Persian cuisine.
 * Groups recipes by category and creates collection articles.
 * 
 * Usage: node scripts/chef_blogger.js [category]
 * Example: node scripts/chef_blogger.js "Rice Dishes"
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

const ARTICLE_TOPICS = [
    { title: "Top 10 Persian Rice Dishes You Must Try", filter: { category: 'Rice' } },
    { title: "Essential Persian Stews (Khoresh) for Beginners", filter: { category: 'Stew' } },
    { title: "Quick Persian Recipes Under 30 Minutes", filter: { prep_time_minutes: { lte: 30 } } },
    { title: "Traditional Persian Desserts and Sweets", filter: { category: 'Dessert' } },
    { title: "Vegetarian Persian Cuisine: A Complete Guide", filter: { category: 'Vegetarian' } },
];

async function run() {
    const topicIndex = parseInt(process.argv[2]) || 0;
    const topic = ARTICLE_TOPICS[topicIndex];

    if (!topic) {
        console.log("Available topics:");
        ARTICLE_TOPICS.forEach((t, i) => console.log(`  ${i}: ${t.title}`));
        return;
    }

    console.log(`📝 Generating: "${topic.title}"...`);

    // Fetch relevant recipes
    let query = supabase.from('recipes').select('id, name, image, instructions, prep_time_minutes');

    if (topic.filter.category) {
        query = query.eq('category', topic.filter.category);
    }

    const { data: recipes, error } = await query.limit(10);

    if (error || !recipes || recipes.length === 0) {
        console.error("No recipes found for this category");
        return;
    }

    console.log(`   Found ${recipes.length} recipes`);

    // Generate article
    const recipeList = recipes.map(r => `- ${r.name}`).join('\n');

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a food blogger and SEO expert for Zaffaron, a Persian cuisine platform.

Task: Write a comprehensive, SEO-optimized blog article.

Title: ${topic.title}

Recipes to feature:
${recipeList}

Requirements:
1. Write 1500-2000 words in HTML format
2. Include an engaging introduction about Persian cuisine
3. Feature each recipe with a brief description
4. Include cooking tips and cultural context
5. End with a compelling conclusion
6. Use proper heading structure (h2, h3)
7. Make it scannable with bullet points
8. Include a meta description (150 chars)

OUTPUT JSON:
{
    "content": "<article>HTML content here</article>",
    "excerpt": "Meta description for SEO",
    "tags": ["tag1", "tag2"]
}`
            }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

    // Save to DB
    const { error: insertError } = await supabase
        .from('blog_posts')
        .upsert({
            slug,
            title: topic.title,
            content: result.content,
            excerpt: result.excerpt,
            tags: result.tags,
            category: 'Recipes',
            featured_image: recipes[0]?.image,
            status: 'draft',
            published_at: new Date().toISOString()
        }, { onConflict: 'slug' });

    if (insertError) {
        console.error("Insert error:", insertError.message);
    } else {
        console.log(`\n✅ Article saved: /blog/${slug}`);
        console.log("   Status: DRAFT (change to 'published' in Supabase to go live)");
    }
}

run();
