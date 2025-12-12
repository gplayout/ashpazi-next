'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Save, SkipForward, ImageIcon, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

export default function CuratorPage() {
    const [recipes, setRecipes] = useState([]);
    const [currentRecipe, setCurrentRecipe] = useState(null);
    const [manualUrl, setManualUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Load missing recipes
    useEffect(() => {
        fetchMissingRecipes();
    }, []);

    async function fetchMissingRecipes() {
        setLoading(true);
        const { data, error } = await supabase
            .from('recipes')
            .select('id, name, ingredients, category')
            .is('image', null)
            .limit(50);

        if (error) {
            console.error(error);
            alert('Error fetching recipes. Check console.');
        } else {
            setRecipes(data || []);
            if (data && data.length > 0) setCurrentRecipe(data[0]);
        }
        setLoading(false);
    }

    async function handleSave() {
        if (!manualUrl) {
            alert("Please paste an image URL first.");
            return;
        }
        if (saving) return; // Prevention

        setSaving(true);
        try {
            const res = await fetch('/api/curator/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: manualUrl,
                    recipeId: currentRecipe.id
                }),
            });

            const result = await res.json();
            if (result.success) {
                setManualUrl(''); // Clear input
                handleNext();
            } else {
                alert('Save failed: ' + (result.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Save error. See console.');
        }
        setSaving(false);
    }

    function handleNext() {
        const nextRecipes = recipes.slice(1);
        setRecipes(nextRecipes);
        setManualUrl('');
        if (nextRecipes.length > 0) {
            setCurrentRecipe(nextRecipes[0]);
        } else {
            setCurrentRecipe(null);
            fetchMissingRecipes();
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-saffron-600 font-bold text-xl"><Loader2 className="animate-spin mr-2" /> Loading Curator...</div>;

    if (!currentRecipe) return <div className="flex h-screen items-center justify-center flex-col">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">All caught up!</h1>
        <p>No recipes missing images in this batch.</p>
        <button onClick={fetchMissingRecipes} className="mt-4 px-4 py-2 bg-saffron-600 text-white rounded">Check Again</button>
    </div>;

    const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=Authentic+Persian+food+${encodeURIComponent(currentRecipe.name)}`;

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
            {/* Left Panel: Recipe Info */}
            <div className="w-1/3 bg-white border-r border-neutral-200 p-8 flex flex-col shadow-xl z-10">
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-saffron-600 uppercase tracking-widest mb-1">The Curator</h2>
                    <h1 className="text-3xl font-black text-neutral-900 leading-tight">{currentRecipe.name}</h1>
                    <div className="mt-2 text-sm text-neutral-500 font-medium">{currentRecipe.category?.name || 'Persian Cuisine'}</div>
                </div>

                <div className="bg-neutral-100 p-4 rounded-xl mb-6">
                    <h3 className="font-bold text-neutral-700 mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2">
                        <li>Click <b>Search Google</b> on the right.</li>
                        <li>Right-click a good image &rarr; <b>Copy Image Address</b>.</li>
                        <li>Paste it in the box.</li>
                        <li>Click <b>Save Image</b>.</li>
                    </ol>
                </div>

                <div className="mt-auto border-t pt-6">
                    <button onClick={handleNext} className="w-full flex items-center justify-center py-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold rounded-xl transition-colors mb-2">
                        <SkipForward className="w-5 h-5 mr-2" /> Skip this Recipe
                    </button>
                    <div className="text-center text-xs text-neutral-400 mt-2">{recipes.length} remaining</div>
                </div>
            </div>

            {/* Right Panel: Manual Entry */}
            <div className="w-2/3 bg-neutral-50 p-8 flex flex-col items-center justify-center">

                <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-lg border border-neutral-100 text-center">
                    <ImageIcon className="w-16 h-16 text-neutral-200 mx-auto mb-6" />

                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">Find a Photo</h2>
                    <p className="text-neutral-500 mb-8">Search Google for "{currentRecipe.name}", copy the image link, and paste it below.</p>

                    {/* Step 1: Search Button */}
                    <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 mb-8 w-full text-lg"
                    >
                        <Search className="w-6 h-6 mr-3" /> Search Google Images <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </a>

                    {/* Step 2: Input */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Paste Image URL here (https://...)"
                            className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:border-saffron-500 focus:ring-0 outline-none text-lg transition-colors"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                        />
                    </div>

                    {/* Preview (if URL is valid-ish) */}
                    {manualUrl && (manualUrl.startsWith('http') || manualUrl.startsWith('data')) && (
                        <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200 h-48 w-full bg-neutral-100 relative">
                            <img src={manualUrl} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                    )}

                    {/* Step 3: Save */}
                    <button
                        onClick={handleSave}
                        disabled={!manualUrl || saving}
                        className={`w-full py-4 font-bold rounded-xl text-lg flex items-center justify-center transition-all ${manualUrl ? 'bg-saffron-600 hover:bg-saffron-700 text-white shadow-lg' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            }`}
                    >
                        {saving ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : <><Save className="w-6 h-6 mr-2" /> Save Image</>}
                    </button>

                </div>

            </div>
        </div>
    );
}
