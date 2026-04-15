"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, MapPin, FileText, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StoreRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "28.6139", // Default Delhi for demo
    longitude: "77.2090",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Store registered successfully!");
        router.push("/dashboard/store");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-surface-low border border-border/10 p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-black uppercase tracking-tighter italic">Register <span className="text-primary not-italic">Store</span></h1>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Onboarding Verification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
           <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4" />
                <input 
                  required
                  placeholder="Official Shop Name"
                  className="w-full bg-surface-lowest border border-border/10 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">About Store</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 text-muted-foreground/30 w-4 h-4" />
                <textarea 
                  placeholder="Describe your lockers, safety measures, etc."
                  className="w-full bg-surface-lowest border border-border/10 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 w-4 h-4" />
                <input 
                  required
                  placeholder="Complete Address for Students"
                  className="w-full bg-surface-lowest border border-border/10 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Latitude</label>
              <input 
                required
                placeholder="28.6139"
                className="w-full bg-surface-lowest border border-border/10 px-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Longitude</label>
              <input 
                required
                placeholder="77.2090"
                className="w-full bg-surface-lowest border border-border/10 px-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              />
           </div>

           <div className="md:col-span-2 pt-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 flex gap-4 mb-8">
                 <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                 <p className="text-[11px] font-medium text-emerald-400/80 leading-relaxed">
                    By submitting, you agree to drop and pick up student items securely. LockerLink takes a 10% commission on successful bookings.
                 </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:scale-[1.01] transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] disabled:opacity-50"
              >
                {loading ? "Processing Registration..." : "Finalize Onboarding"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
