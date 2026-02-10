import { Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <p className="text-7xl font-bold text-primary/20">404</p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Page not found</h2>
                    <p className="text-muted-foreground text-sm">
                        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Search recipes
                    </Link>
                </div>
            </div>
        </div>
    );
}
