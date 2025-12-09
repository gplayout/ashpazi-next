import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChefHat, Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

// SEO Metadata
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const { data: post } = await supabase
        .from('blog_posts')
        .select('title, excerpt, featured_image')
        .eq('slug', slug)
        .single();

    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | Zaffaron Blog`,
        description: post.excerpt || post.title,
        openGraph: {
            images: [post.featured_image || '/og-default.jpg'],
        },
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;

    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Hero Image */}
            <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
                {post.featured_image ? (
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ChefHat size={80} className="text-muted-foreground/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-10">
                    <Link href="/blog">
                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-10">
                <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                        {post.category && (
                            <Badge variant="secondary">{post.category}</Badge>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        </div>
                        <span>By {post.author}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Content */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-6 border-t border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Tag size={16} className="text-muted-foreground" />
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
