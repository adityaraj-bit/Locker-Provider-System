"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { setRole } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setUserRole] = useState<"STUDENT" | "STORE_OWNER">("STUDENT");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password, role }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setRole(data.data.role);
            localStorage.setItem("role", data.data.role);
            
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-surface-lowest text-foreground overflow-hidden">
        {/* LEFT - Branding Section */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center px-24 relative bg-surface-lowest">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-40 animate-pulse pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
                <h1 className="text-[120px] font-black tracking-tighter uppercase leading-[0.8] mix-blend-difference select-none italic">
                    Locker <br /> <span className="text-primary not-italic">Link</span>
                </h1>
                <p className="max-w-md text-xl font-medium text-muted-foreground leading-relaxed">
                    Smart temporary storage for exam days. Find nearby shops and secure your belongings with ease.
                </p>
            </div>

            <div className="absolute bottom-12 left-24 flex items-center gap-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Purpose</span>
                    <span className="text-xs font-bold text-foreground font-mono italic">Exam Day Security</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Verification</span>
                    <span className="text-xs font-bold text-primary font-mono italic">QR & OTP Protected</span>
                </div>
            </div>
        </div>

        {/* RIGHT - Auth Section */}
        <div className="flex items-center justify-center lg:col-span-5 px-6 relative bg-surface-low lg:bg-transparent overflow-y-auto py-12">
            <div className="lg:hidden absolute inset-0 bg-surface-lowest" />
            
            <form
                onSubmit={handleRegister}
                className="w-full max-w-sm relative z-10 bg-surface-highest/60 backdrop-blur-3xl p-10 rounded-sm border border-border/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            >
                <div className="mb-10 space-y-2 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">
                        Join Platform
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
                        Create Secure Profile
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border-l-2 border-destructive p-4 mb-6">
                        <p className="text-destructive text-[11px] font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    {/* ROLE SELECTION */}
                    <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-surface-lowest border border-border/10 rounded-sm">
                        <button 
                            type="button"
                            onClick={() => setUserRole("STUDENT")}
                            className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'STUDENT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-low'}`}
                        >
                            <User size={14} /> Student
                        </button>
                        <button 
                            type="button"
                            onClick={() => setUserRole("STORE_OWNER")}
                            className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'STORE_OWNER' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-low'}`}
                        >
                            <Store size={14} /> Shop Owner
                        </button>
                    </div>

                    {/* NAME */}
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary">Full Name</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4 transition-colors group-focus-within:text-primary/50" />
                            <input
                                type="text"
                                placeholder="Operator Name"
                                className="w-full bg-surface-lowest/80 border border-border/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary">Email Address</label>
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

                    {/* PHONE */}
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4 transition-colors group-focus-within:text-primary/50" />
                            <input
                                type="tel"
                                placeholder="+91 00000 00000"
                                className="w-full bg-surface-lowest/80 border border-border/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
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
                    className="w-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] py-4 rounded-sm transition-all hover:scale-[1.02] shadow-[0_20px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Establishing Identity..." : "Authorize Access"}
                </button>

                <p className="text-[10px] font-bold text-center mt-8 text-muted-foreground uppercase tracking-[0.2em]">
                    Already linked?{" "}
                    <span
                        className="text-primary cursor-pointer hover:underline underline-offset-4 decoration-primary/40"
                        onClick={() => router.push("/login")}
                    >
                        Access Terminal
                    </span>
                </p>
            </form>
        </div>
    </div>
    );
}
