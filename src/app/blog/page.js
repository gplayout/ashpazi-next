import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

export const metadata = {
    title: 'Blog | Zaffaron',
    description: 'Explore Persian cuisine through our curated articles, cooking tips, and recipe collections.',
};

export default async function BlogPage() {
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Blog fetch error:', error);
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Hero */}
            <section className="relative w-full py-20 px-6 bg-gradient-to-b from-primary/10 to-background flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/20 rounded-full mb-2">
                    <ChefHat size={40} className="text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                    Zaffaron Blog
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                    Discover the secrets of Persian cuisine, cooking tips, and curated recipe collections.
                </p>
            </section>

            {/* Blog Grid */}
            <section className="container mx-auto px-4 md:px-6 mt-12">
                {!posts || posts.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground text-lg mb-4">No blog posts yet.</p>
                        <p className="text-sm text-muted-foreground">Check back soon for amazing content!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                                <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative aspect-video bg-muted">
                                        {post.featured_image ? (
                                            <Image
                                                src={post.featured_image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ChefHat size={48} className="text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="p-4 pb-2">
                                        {post.category && (
                                            <Badge variant="secondary" className="mb-2 w-fit">
                                                {post.category}
                                            </Badge>
                                        )}
                                        <h2 className="text-xl font-bold group-hover:text-amber-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-0 space-y-3">
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {post.excerpt || post.content?.slice(0, 150) + '...'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar size={14} />
                                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
