import { supabase } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { imageUrl, recipeId } = await request.json();

        if (!imageUrl || !recipeId) {
            return NextResponse.json({ error: 'imageUrl and recipeId are required' }, { status: 400 });
        }

        console.log(`💾 [Curator] Saving image for Recipe ${recipeId}...\n Source: ${imageUrl}`);

        // 1. Fetch the image
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

        // 2. Generate filename
        const fileName = `curator/${recipeId}-${Date.now()}.jpg`;
        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

        // 3. Upload to Supabase
        const { error: uploadError } = await supabase
            .storage
            .from('recipe-images')
            .upload(fileName, imageBuffer, {
                contentType,
                upsert: true,
            });
        if (uploadError) {
            console.error('❌ Supabase Upload Error:', uploadError);
            return NextResponse.json({ error: 'Upload failed', details: uploadError }, { status: 500 });
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('recipe-images')
            .getPublicUrl(fileName);

        // 5. Update Recipe Record
        const { error: updateError } = await supabase
            .from('recipes')
            .update({ image: publicUrl })
            .eq('id', recipeId);

        if (updateError) {
            console.error('❌ Supabase DB Update Error:', updateError);
            return NextResponse.json({ error: 'DB Update failed', details: updateError }, { status: 500 });
        }

        console.log(`✅ [Curator] Success! Saved to: ${publicUrl}`);
        return NextResponse.json({ success: true, publicUrl });

    } catch (error) {
        console.error('❌ [Curator] Save route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
