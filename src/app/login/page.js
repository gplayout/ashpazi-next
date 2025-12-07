'use client'

import { login, signup } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleSignIn from "@/components/GoogleSignIn"
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex bg-background font-[family-name:var(--font-vazirmatn)]">

            {/* LEFT: Visual Art Section (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative bg-neutral-900 border-r border-neutral-800 p-12 text-white">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=1920&auto=format&fit=crop"
                        alt="Persian Spices"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-bold text-2xl tracking-tight text-amber-500">Zaffaron</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg space-y-4">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                        Master the Art of <br /> <span className="text-amber-500">Persian Cuisine</span>
                    </h1>
                    <p className="text-lg text-neutral-400">
                        Join our community of chefs and food lovers. Save your favorite recipes, create shopping lists, and explore the authentic tastes of Iran.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-neutral-500">
                    © 2026 Zaffaron Group. All rights reserved.
                </div>
            </div>

            {/* RIGHT: Login Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="w-full max-w-sm space-y-8">

                    <div className="flex flex-col space-y-2 text-center items-center">
                        <Link href="/" className="lg:hidden font-bold text-2xl text-amber-600 mb-8">Zaffaron</Link>
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                    </div>

                    <div className="space-y-4">
                        <GoogleSignIn />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="name@example.com" required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-amber-600 hover:underline">Forgot password?</a>
                                </div>
                                <Input id="password" name="password" type="password" required className="h-11" />
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <Button formAction={login} className="h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium">
                                    Sign In
                                </Button>
                                <Button formAction={signup} variant="ghost" className="h-11 text-muted-foreground hover:text-black dark:hover:text-white">
                                    Create an account
                                </Button>
                            </div>
                        </form>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
                    </p>
                </div>
            </div>

        </div>
    )
}
