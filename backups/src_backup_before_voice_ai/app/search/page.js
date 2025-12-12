'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, Flame, ChefHat, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import RecipeCard from '@/components/RecipeCard';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const TIME_OPTIONS = ['time_quick', 'time_medium', 'time_long'];
const CATEGORY_OPTIONS = ['Rice', 'Stew', 'Kebab', 'Soup', 'Dessert', 'Salad', 'Appetizer'];

export default function SearchPage() {
    const { language } = useLanguage();
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        difficulty: null,
        timeRange: null,
        category: null,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2 || Object.values(filters).some(v => v !== null)) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, filters]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (filters.difficulty) params.set('difficulty', filters.difficulty);
            if (filters.timeRange !== null) params.set('time', filters.timeRange);
            if (filters.category) params.set('category', filters.category);

            const response = await fetch(`/api/search?${params.toString()}`);
            const data = await response.json();
            setResults(data.recipes || []);
        } catch (error) {
            console.error('Search error:', error);
        }
        setLoading(false);
    };

    const clearFilters = () => {
        setFilters({ difficulty: null, timeRange: null, category: null });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== null);

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Header */}
            <section className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border/40 py-4">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Search Input */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <Input
                                placeholder={getUiLabel('search_placeholder', language)}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 h-12 text-lg"
                            />
                            {loading && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" size={20} />
                            )}
                        </div>
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="icon"
                            className="h-12 w-12"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={20} />
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/40 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            {/* Difficulty */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Flame size={16} className="text-orange-500" />
                                    {getUiLabel('difficulty', language)}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {DIFFICULTY_OPTIONS.map((opt) => (
                                        <Badge
                                            key={opt}
                                            variant={filters.difficulty === opt ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/20"
                                            onClick={() => setFilters(f => ({
                                                ...f,
                                                difficulty: f.difficulty === opt ? null : opt
                                            }))}
                                        >
                                            {getUiLabel(opt, language)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Clock size={16} className="text-amber-600" />
                                    {getUiLabel('cooking_time', language)}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {TIME_OPTIONS.map((opt, idx) => (
                                        <Badge
                                            key={idx}
                                            variant={filters.timeRange === idx ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/20"
                                            onClick={() => setFilters(f => ({
                                                ...f,
                                                timeRange: f.timeRange === idx ? null : idx
                                            }))}
                                        >
                                            {getUiLabel(opt, language)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <ChefHat size={16} className="text-purple-500" />
                                    {getUiLabel('category', language)}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <Badge
                                            key={opt}
                                            variant={filters.category === opt ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/20"
                                            onClick={() => setFilters(f => ({
                                                ...f,
                                                category: f.category === opt ? null : opt
                                            }))}
                                        >
                                            {getUiLabel(opt, language)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                    <X size={16} className="mr-1" />
                                    {getUiLabel('clear_filters', language)}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Results */}
            <section className="container mx-auto px-4 md:px-6 mt-8">
                {results.length > 0 ? (
                    <>
                        <p className="text-sm text-muted-foreground mb-6">
                            {results.length} {getUiLabel('found_recipes', language)}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        {query.length >= 2 || hasActiveFilters ? (
                            <p className="text-muted-foreground">{getUiLabel('no_results', language)}</p>
                        ) : (
                            <div className="space-y-4">
                                <Search size={48} className="mx-auto text-muted-foreground/30" />
                                <p className="text-muted-foreground">{getUiLabel('start_typing', language)}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

