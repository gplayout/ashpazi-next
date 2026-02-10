'use client';

import { useState } from 'react';
interface SkeletonData {
    id: string;
    slug: string;
    [key: string]: unknown;
}

import { createSkeleton, saveSkin } from '../../actions/ingest';

export default function IngestPage(): React.JSX.Element {
    const [step, setStep] = useState('A');
    const [skeleton, setSkeleton] = useState<SkeletonData | null>(null);
    const [message, setMessage] = useState('');
    const [flags, setFlags] = useState<string[]>([]);

    async function handleSkeleton(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await createSkeleton(formData);
        if (res.success) {
            setSkeleton(res.data as SkeletonData);
            setStep('B');
            setMessage(`Skeleton Created: ${res.data!.slug} (${res.data!.id})`);
        } else {
            setMessage(`Error: ${res.error}`);
        }
    }

    async function handleSkin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Append context
        formData.append('recipe_id', skeleton!.id);

        // Manual call to action to handle response easily
        // (In real app, use usageFormState/server actions pattern, here just simple wrapper)
        const res = await saveSkin(null, formData);

        if (res.success) {
            setMessage(`Skin Saved for ${formData.get('lang_code')}!`);
            setFlags(res.flags || []);
        } else {
            setMessage(`Error: ${res.error}`);
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4">Manual Ingestion Pipeline V2</h1>

            {message && <div className="p-4 bg-blue-100 mb-4 rounded">{message}</div>}

            {flags.length > 0 && (
                <div className="p-4 bg-yellow-100 mb-4 rounded border border-yellow-300">
                    <strong>Quality Warnings (Saved Anyway):</strong>
                    <ul className="list-disc ml-4">
                        {flags.map(f => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}

            {step === 'A' && (
                <form
                    onSubmit={handleSkeleton}
                    className="space-y-4 border p-6 rounded bg-white shadow"
                >
                    <h2 className="text-xl font-bold">Step A: Create Skeleton</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm">English Title (Required)</span>
                            <input
                                name="title"
                                required
                                className="w-full border p-2 rounded"
                                placeholder="e.g. Ghormeh Sabzi"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Slug (Optional - Auto)</span>
                            <input
                                name="slug"
                                className="w-full border p-2 rounded"
                                placeholder="ghormeh-sabzi"
                            />
                        </label>
                        <label className="block col-span-2">
                            <span className="text-sm">Image URL (Required)</span>
                            <input
                                name="image_url"
                                required
                                className="w-full border p-2 rounded"
                                defaultValue="/placeholder.jpg"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Prep Time (min)</span>
                            <input
                                name="prep_time"
                                type="number"
                                defaultValue="30"
                                className="w-full border p-2 rounded"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Cook Time (min)</span>
                            <input
                                name="cook_time"
                                type="number"
                                defaultValue="60"
                                className="w-full border p-2 rounded"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Servings</span>
                            <input
                                name="servings"
                                type="number"
                                defaultValue="4"
                                className="w-full border p-2 rounded"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Region</span>
                            <input name="region" className="w-full border p-2 rounded" />
                        </label>
                        <label className="block">
                            <span className="text-sm">Difficulty</span>
                            <select name="difficulty" className="w-full border p-2 rounded">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </label>
                    </div>
                    <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                        Create Skeleton
                    </button>
                </form>
            )}

            {step === 'B' && skeleton && (
                <form
                    onSubmit={handleSkin}
                    className="space-y-4 border p-6 rounded bg-white shadow bg-gray-50"
                >
                    <h2 className="text-xl font-bold">Step B: Edit Skin</h2>
                    <div className="text-sm text-gray-500 mb-4">
                        Editing: {skeleton.slug} ({skeleton.id})
                    </div>

                    <div className="flex gap-4 mb-4">
                        <select name="lang_code" className="border p-2 rounded font-bold">
                            <option value="en">English (EN)</option>
                            <option value="fa">Farsi (FA)</option>
                            <option value="de">German (DE)</option>
                        </select>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="status" />
                            <span>Publish?</span>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm">Localized Title</span>
                        <input name="title" className="w-full border p-2 rounded" />
                    </label>

                    <label className="block">
                        <span className="text-sm">Description</span>
                        <textarea name="description" className="w-full border p-2 rounded h-20" />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm">Ingredients (One per line)</span>
                            <textarea
                                name="ingredients"
                                className="w-full border p-2 rounded h-40 font-mono text-sm"
                                placeholder="1 cup Rice&#10;2 tbsp Oil"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Instructions (One per line)</span>
                            <textarea
                                name="instructions"
                                className="w-full border p-2 rounded h-40 font-mono text-sm"
                            />
                        </label>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setStep('A')}
                            className="text-gray-500 underline"
                        >
                            Back to Skeleton
                        </button>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Save Skin & Check Quality
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
