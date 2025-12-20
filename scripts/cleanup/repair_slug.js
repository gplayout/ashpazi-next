
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function repairSlug() {
    console.log('Repairing Slug for 1541...');

    const targetSlug = 'Classic-Chinese-Style-Egg-Fried-Rice';

    const { data, error } = await supabase
        .from('recipes')
        .update({ slug: targetSlug })
        .eq('id', 1541)
        .select();

    if (error) {
        console.error('Error updating slug:', error);
    } else {
        console.log('Success! Updated recipe:', data);
    }
}

repairSlug();
