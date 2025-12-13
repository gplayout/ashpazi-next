import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function useNutrition(recipe) {
    const { language } = useLanguage();
    const [nutritionData, setNutritionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const title = recipe.name || recipe.title;

        // 1. Check Local DB Data (Optimization)
        if (recipe.nutrition_info && recipe.nutrition_info[language]) {
            const localData = recipe.nutrition_info[language];

            // Normalize 'nutrition' object to expected UI structure
            if (localData.nutrition) {
                // Map nested 'nutrition' (from Agent) to root keys (for UI)
                localData.calories = localData.nutrition.calories;
                localData.macros = {
                    protein: localData.nutrition.protein,
                    carbs: localData.nutrition.carbs,
                    fat: localData.nutrition.fat
                };
            }
            // Legacy mapping
            else if (localData.macro_nutrients && !localData.macros) {
                localData.macros = localData.macro_nutrients;
            }

            console.log("⚡ Nutrition (Local Normalized):", localData);
            setNutritionData(localData);
            setLoading(false);
            return;
        }

        if (!title) {
            setLoading(false);
            return;
        }

        // 2. Fetch from API (Fallback)
        const fetchNutrition = async () => {
            try {
                // ... same fetch logic ...
                const res = await fetch('/api/nutrition', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        ingredients: recipe.ingredients,
                        language
                    })
                });
                if (!res.ok) throw new Error('Failed to fetch');
                const result = await res.json();

                // Normalization here too just in case
                if (result.macro_nutrients && !result.macros) {
                    result.macros = result.macro_nutrients;
                }

                setNutritionData(result);
            } catch (err) {
                console.error('Nutrition Hook Error:', err);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchNutrition();
    }, [recipe, language]); // Added recipe dependency

    return { nutritionData, loading };
}
