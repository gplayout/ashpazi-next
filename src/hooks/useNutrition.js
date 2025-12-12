import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function useNutrition(recipe) {
    const { language } = useLanguage();
    const [nutritionData, setNutritionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const title = recipe.name || recipe.title;
        if (!title) {
            setLoading(false);
            return;
        }

        const fetchNutrition = async () => {
            try {
                const res = await fetch('/api/nutrition', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        ingredients: recipe.ingredients,
                        language
                    })
                });
                if (!res.ok) {
                    console.error('Fetch failed:', res.status);
                    throw new Error('Failed to fetch');
                }
                const result = await res.json();
                setNutritionData(result);
            } catch (err) {
                console.error('Nutrition Hook Error:', err);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchNutrition();
    }, [recipe.name, recipe.title, language]);

    return { nutritionData, loading };
}
