"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { setRole } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const response = await res.json();
            if (!res.ok) throw new Error(response.error);

            const role = response.data.role;
            localStorage.setItem("role", role);
            setRole(role);

            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-surface-lowest text-foreground overflow-hidden">
        {/* LEFT - Branding Section */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center px-24 relative bg-surface-lowest">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-30 animate-pulse pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
                <h1 className="text-[120px] font-black tracking-tighter uppercase leading-[0.8] mix-blend-difference select-none italic">
                    Locker <br /> <span className="text-primary not-italic">Link</span>
                </h1>
                <p className="max-w-md text-xl font-medium text-muted-foreground leading-relaxed">
                    Access your smart storage terminal. Secure, reliable, and simplified for your exam success.
                </p>
            </div>

            <div className="absolute bottom-12 left-24 flex items-center gap-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono italic">Operational</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Version</span>
                    <span className="text-xs font-bold text-foreground font-mono italic">v2.1.0-Locker</span>
                </div>
            </div>
        </div>

        {/* RIGHT - Auth Section */}
        <div className="flex items-center justify-center lg:col-span-5 px-6 relative bg-surface-low lg:bg-transparent">
            <div className="lg:hidden absolute inset-0 bg-surface-lowest" />
            
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm relative z-10 bg-surface-highest/60 backdrop-blur-3xl p-10 rounded-sm border border-border/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            >
                <div className="mb-10 space-y-2 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">
                        Access Key
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
                        Credentials Verification Required
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border-l-2 border-destructive p-4 mb-6">
                        <p className="text-destructive text-[11px] font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    {/* EMAIL */}
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary">Identity Email</label>
                        <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4 transition-colors group-focus-within:text-primary/50" />
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                className="w-full bg-surface-lowest/80 border border-border/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary">Secure Token</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4 transition-colors group-focus-within:text-primary/50" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-surface-lowest/80 border border-border/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] py-4 rounded-sm transition-all hover:scale-[1.02] shadow-[0_20px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Initialize Session"}
                </button>

                <p className="text-[10px] font-bold text-center mt-8 text-muted-foreground uppercase tracking-[0.2em]">
                    New provider?{" "}
                    <span
                        className="text-primary cursor-pointer hover:underline underline-offset-4 decoration-primary/40"
                        onClick={() => router.push("/register")}
                    >
                        Register Terminal
                    </span>
                </p>
            </form>
        </div>
    </div>
    );
}
