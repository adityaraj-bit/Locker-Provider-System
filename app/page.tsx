"use client";

import { useRouter } from "next/navigation";
import { Package, ShieldCheck, MapPin, Clock, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface-lowest/80 backdrop-blur-md border-b border-border/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <Package className="text-primary" size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Locker<span className="text-primary not-italic">Link</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">How it works</a>
          <a href="#trust" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Safety</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/login")}
            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-surface-low transition-all"
          >
            Login
          </button>
          <button 
            onClick={() => router.push("/register")}
            className="bg-primary text-primary-foreground px-6 py-2 text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:scale-105 transition-all"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-40 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
            <ShieldCheck size={14} /> Official Exam Storage Partner
          </div>
          
          <h1 className="text-[80px] md:text-[110px] font-black tracking-tighter uppercase leading-[0.85] italic">
            Secure Your <br /> <span className="text-primary not-italic">Success</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-xl font-medium text-muted-foreground leading-relaxed">
            Students attending exams (JEE, NEET, CUET) can now find verified nearby storage for bags, phones, and valuables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={() => router.push("/register?role=STUDENT")}
              className="w-full sm:w-auto bg-foreground text-background px-10 py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-3"
            >
              Book a Locker <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => router.push("/register?role=STORE_OWNER")}
              className="w-full sm:w-auto bg-surface-low border border-border/10 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-surface-high transition-all"
            >
              List Your Shop
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: MapPin, 
              title: "Proximity Search", 
              desc: "Find verified storage locations within 1km of your exam center." 
            },
            { 
              icon: ShieldCheck, 
              title: "Escrow Güarantee", 
              desc: "Payments are held in escrow until items are safely returned to you." 
            },
            { 
              icon: Clock, 
              title: "Instant Verification", 
              desc: "Digital QR and OTP verification for automated drop & pickup." 
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-low/30 border border-border/5 p-10 space-y-4 hover:border-primary/20 transition-all group"
            >
              <feature.icon className="text-primary group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-2xl font-black uppercase tracking-tight italic">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Proof Section */}
      <section id="trust" className="bg-surface-low/50 py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Trusted by thousands of <span className="text-primary not-italic">Students</span></h2>
            <div className="grid md:grid-cols-4 gap-8 w-full">
               {[
                 { val: "50,000+", label: "Safe Storage Logs" },
                 { val: "2,500+", label: "Verified Shop Partners" },
                 { val: "4.9/5", label: "Student Satisfaction" },
                 { val: "100%", label: "Item Security Rate" }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                    <p className="text-4xl font-black tracking-tighter text-foreground">{stat.val}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="bg-primary p-16 md:p-24 rounded-sm text-primary-foreground text-center space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-[60px] md:text-[90px] font-black tracking-tighter uppercase leading-[0.8] relative z-10 italic">Ready for <br /> Exam Day?</h2>
          <button 
            onClick={() => router.push("/register")}
            className="bg-foreground text-background px-12 py-5 text-sm font-black uppercase tracking-[0.3em] relative z-10 hover:scale-105 transition-all shadow-2xl"
          >
            Create My Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/5 py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
        <div className="flex items-center gap-2">
            <Package size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">LockerLink Platform &copy; 2026</span>
        </div>
        <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary">Term of Security</a>
            <a href="#" className="hover:text-primary">Provider Logic</a>
            <a href="#" className="hover:text-primary">Support</a>
        </div>
      </footer>
    </div>
  );
}