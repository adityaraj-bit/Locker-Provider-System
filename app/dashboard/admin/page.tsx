"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Store, MapPin, CheckCircle, XCircle, AlertCircle, Package, Star, MessageSquare, IndianRupee, Eye, Phone, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InfoTooltip from "@/components/InfoTooltip";

export default function AdminDashboard() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stores"); // stores | issues | reviews

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, iRes, rRes] = await Promise.all([
        fetch("/api/admin/stores"),
        fetch("/api/admin/issues"),
        fetch("/api/admin/reviews")
      ]);

      const sData = await sRes.json();
      const iData = await iRes.json();
      const rData = await rRes.json();

      if (sData.success) setStores(sData.data);
      if (iData.success) setIssues(iData.data);
      if (rData.success) setReviews(rData.data);
    } catch {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStore = async (id: string, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/stores/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified })
      });
      if ((await res.json()).success) {
        toast.success(verified ? "Store Verified" : "Verification Rescinded");
        fetchAllData();
      }
    } catch {
      toast.error("Process failed");
    }
  };

  const handleResolveIssue = async (issueId: string, action: 'RESOLVE' | 'REFUND') => {
    try {
      const res = await fetch(`/api/admin/issues/${issueId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'RESOLVE' ? "Funds released to vendor" : "Student Refund Processed");
        fetchAllData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Resolution failed");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    setRole(null);
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-surface-lowest flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground flex flex-col">
      <header className="border-b border-border/10 bg-surface-low/50 backdrop-blur-xl px-4 md:px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-primary" size={24} />
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Nexus <span className="text-primary">Admin</span></h1>
        </div>

        <nav className="flex items-center gap-1 bg-surface-lowest p-1 rounded-sm border border-border/5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'stores', label: 'Centers', icon: Store },
            { id: 'issues', label: 'Issues', icon: AlertCircle },
            { id: 'reviews', label: 'Reviews', icon: MessageSquare }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-low'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="hidden md:flex p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-sm transition-colors">
          <XCircle size={20} />
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-[1500px] mx-auto w-full space-y-8 animate-in fade-in duration-500">
        {/* VIEW: STORES */}
        {activeTab === "stores" && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Partner Records</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Audit storage providers & center verification</p>
               </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-surface-low/20 border border-border/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/5 bg-surface-low/50">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-8">Store Info</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provider</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      Earnings Audit <InfoTooltip text="Calculated based on booking history and verified completions." />
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {stores.map(store => (
                    <tr key={store.id} className="group hover:bg-primary/5 transition-colors">
                      <td className="p-4 pl-8">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-surface-highest flex items-center justify-center font-black text-primary border border-primary/20">{store.name[0]}</div>
                            <div>
                               <p className="font-bold text-sm">{store.name}</p>
                               <p className="text-[10px] text-muted-foreground italic">{store.address}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                         <p className="text-sm font-bold uppercase">{store.owner.name}</p>
                         <p className="text-[10px] text-muted-foreground font-mono">{store.owner.phone}</p>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                            <IndianRupee className="text-emerald-500" size={14} />
                            <span className="font-black">{(store.bookings?.length || 0) * 50}</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Est. Rev</span>
                         </div>
                      </td>
                      <td className="p-4">
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${store.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {store.isVerified ? 'VERIFIED' : 'PENDING'}
                         </span>
                      </td>
                      <td className="p-4 text-right pr-8">
                         <button 
                           onClick={() => handleVerifyStore(store.id, !store.isVerified)}
                           className={`p-2 rounded transition-all ${store.isVerified ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                         >
                            {store.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden grid gap-4">
              {stores.map(store => (
                <div key={store.id} className="bg-surface-low/30 border border-border/10 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-highest flex items-center justify-center font-black text-primary border border-primary/20 text-xl">{store.name[0]}</div>
                      <div>
                        <h3 className="font-black uppercase tracking-tight text-lg">{store.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{store.address}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${store.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {store.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border/5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Provider</p>
                      <p className="text-xs font-black uppercase">{store.owner.name}</p>
                    </div>
                    <button 
                       onClick={() => handleVerifyStore(store.id, !store.isVerified)}
                       className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${store.isVerified ? 'border-destructive/20 text-destructive bg-destructive/5' : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'}`}
                    >
                      {store.isVerified ? 'Disable' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ISSUES */}
        {activeTab === "issues" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Dispute Resolution</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Moderate student complaints & financial claims</p>
             </div>

             <div className="grid gap-6">
                {issues.map(issue => (
                  <div key={issue.id} className="bg-surface-low border border-border/10 p-6 md:p-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center relative overflow-hidden group">
                     {issue.status === 'OPEN' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
                     
                     <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                           <span className="bg-surface-highest px-3 py-1 text-[10px] font-black uppercase text-muted-foreground border border-border/5">Issue #{issue.id.slice(0,8)}</span>
                           <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${issue.status === 'OPEN' ? 'text-amber-500' : issue.status === 'REFUNDED' ? 'text-destructive' : 'text-emerald-500'}`}>
                             {issue.status}
                             <InfoTooltip text={issue.status === 'OPEN' ? "Vendor funds are currently frozen for this booking." : "Dispute closed. Funds moved accordingly."} />
                           </span>
                        </div>
                        
                        <div>
                           <h4 className="text-xl font-black uppercase tracking-tight text-foreground">{issue.reason}</h4>
                           <p className="text-sm text-muted-foreground italic mt-2 leading-relaxed">"{issue.description}"</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-border/5">
                           <div className="space-y-3">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Impacted Center & Provider</p>
                              <div className="bg-surface-lowest p-4 border border-border/5 space-y-1">
                                 <p className="text-sm font-black italic uppercase">{issue.store.name}</p>
                                 <div className="flex items-center gap-2 mt-2">
                                    <UserIcon size={12} className="text-muted-foreground" />
                                    <p className="text-[10px] font-bold uppercase">{issue.store.owner.name}</p>
                                 </div>
                                 <a href={`tel:${issue.store.owner.phone}`} className="flex items-center gap-2 text-primary hover:underline mt-1">
                                    <Phone size={12} />
                                    <p className="text-[10px] font-mono font-bold tracking-widest">{issue.store.owner.phone}</p>
                                    <span className="text-[8px] bg-primary/10 px-1 rounded uppercase">Call Vendor</span>
                                 </a>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Claimant Details</p>
                              <div className="bg-surface-lowest p-4 border border-border/5 space-y-1">
                                 <p className="text-sm font-black italic uppercase text-primary">{issue.user.name}</p>
                                 <a href={`tel:${issue.user.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-2 transition-colors">
                                    <Phone size={12} />
                                    <p className="text-[10px] font-mono font-bold tracking-widest">{issue.user.phone}</p>
                                    <span className="text-[8px] bg-surface-highest px-1 rounded uppercase">Call Student</span>
                                 </a>
                              </div>
                           </div>
                        </div>
                     </div>

                     {issue.status === 'OPEN' && (
                        <div className="flex flex-col gap-3 w-full xl:w-64">
                           <button 
                             onClick={() => handleResolveIssue(issue.id, 'REFUND')}
                             className="w-full bg-destructive text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-destructive/20"
                           >
                             Approve Refund
                           </button>
                           <button 
                             onClick={() => handleResolveIssue(issue.id, 'RESOLVE')}
                             className="w-full bg-surface-highest text-foreground border border-border/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                           >
                              Release to Vendor
                           </button>
                        </div>
                     )}
                  </div>
                ))}
                {issues.length === 0 && (
                   <div className="p-20 text-center border-2 border-dashed border-border/5 opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">System Clean: No Active Disputes</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* VIEW: REVIEWS */}
        {activeTab === "reviews" && (
           <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Experience Audits</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Public feedback & quality signals</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {reviews.map(review => (
                   <div key={review.id} className="bg-surface-low border border-border/10 p-8 space-y-6 group relative overflow-hidden">
                      <div className="flex justify-between items-start">
                         <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                               <Star key={s} size={14} className={s <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/10'} />
                            ))}
                         </div>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-foreground italic leading-relaxed font-medium">"{review.comment}"</p>
                      <div className="pt-6 border-t border-border/5 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-tight text-primary">{review.user.name}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Verified Student</p>
                         </div>
                         <div className="text-right">
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter italic">
                               <Store size={10} className="text-primary" /> {review.store.name}
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
                 {reviews.length === 0 && (
                   <div className="col-span-full p-20 text-center opacity-30 italic text-[10px] uppercase font-bold tracking-widest">
                      Customer feedback feed is empty
                   </div>
                 )}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
