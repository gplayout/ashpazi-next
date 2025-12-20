import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function useNutrition(recipe, overrideLang) {
    const { language: contextLang } = useLanguage();
    const language = overrideLang || contextLang;
    const [nutritionData, setNutritionData] = useState(() => {
        // Optimization: Initialize directly from prop if available (Zero-Flash)
        if (recipe?.nutrition_info?.[language]) {
            const data = recipe.nutrition_info[language];
            // Simple validation check (sync version of effect logic)
            if (data.name && (data.description || data.ingredients?.length)) {
                // Normalize on init
                if (data.nutrition) {
                    data.calories = data.nutrition.calories;
                    data.category = data.category;
                    data.macros = {
                        protein: data.nutrition.protein,
                        carbs: data.nutrition.carbs,
                        fat: data.nutrition.fat
                    };
                }
                return data;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check Local DB Data (Optimization)
        if (recipe.nutrition_info && recipe.nutrition_info[language]) {
            const localData = recipe.nutrition_info[language];

            // Validate that we have translated content
            const hasTranslation = localData.name && (localData.description || (localData.ingredients && localData.ingredients.length > 0));

            if (hasTranslation) {
                // Normalize 'nutrition' object to expected UI structure
                if (localData.nutrition) {
                    localData.calories = localData.nutrition.calories;
                    localData.category = localData.category;
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

                setNutritionData(localData);
                setLoading(false);
                return;
            }
        }

        // If no local data, we just stop loading. 
        // We do NOT fall back to API anymore (Logic Removed per User Request).
        console.log("No rich content found in DB for lang:", language);
        setLoading(false);

    }, [recipe, language]);

    return { nutritionData, loading };
}
