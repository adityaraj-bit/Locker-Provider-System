"use client";

import { useState, useEffect } from "react";
import { Package, Users, Calendar, CheckCircle, Plus, LogOut, Store, MapPin, Wallet, AlertCircle, TrendingUp, ArrowUpRight, Info, User as UserIcon, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InfoTooltip from "@/components/InfoTooltip";

export default function StoreOwnerDashboard() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({ walletBalance: 0, frozenBalance: 0, activeIssues: 0, canWithdraw: false });
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  
  const [showCapacity, setShowCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(50);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storeRes = await fetch("/api/stores/me");
      const storeData = await storeRes.json();
      
      if (storeData.success && storeData.data) {
        setStore(storeData.data);
        const bookingRes = await fetch("/api/bookings");
        const bookingData = await bookingRes.json();
        if (bookingData.success) setBookings(bookingData.data);

        const walletRes = await fetch("/api/wallet");
        const walletData = await walletRes.json();
        if (walletData.success) setWallet(walletData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (verifyCode.trim().length === 0) {
      toast.error("Enter a code");
      return;
    }
    if (verifying) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/bookings/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: verifyCode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchData(); 
        setVerifyCode("");
      } else {
        toast.error(data.error);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = async (bookingId: string, action: 'CHECK_IN' | 'CHECK_OUT') => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Success: ${action}`);
        fetchData();
      } else {
        toast.error(data.error);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) return;
    try {
        const res = await fetch("/api/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Number(withdrawalAmount) })
        });
        const data = await res.json();
        if (data.success) {
            toast.success(data.message);
            fetchData();
            setWithdrawalAmount("");
        } else {
            toast.error(data.error);
        }
    } catch {
        toast.error("Withdrawal failed");
    }
  }

  const handleUpdateCapacity = async () => {
    try {
      const res = await fetch(`/api/stores/${store.id}/capacity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: new Date().toISOString().split('T')[0],
          totalSlots: newCapacity 
        })
      });
      if ((await res.json()).success) {
        toast.success("Capacity Updated");
        setShowCapacity(false);
        fetchData();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    setRole(null);
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-surface-lowest flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-surface-lowest flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-surface-low p-10 border border-border/10 text-center space-y-6">
          <Store className="text-primary mx-auto" size={48} />
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Register Store</h2>
          <button onClick={() => router.push("/dashboard/store/register")} className="w-full bg-primary text-primary-foreground py-4 font-black uppercase tracking-widest">Onboard Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground flex flex-col">
      <header className="border-b border-border/10 bg-surface-low/50 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Package className="text-primary" size={24} />
          <h1 className="hidden sm:block text-2xl font-black tracking-tighter uppercase">Provider Portal</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-xs font-black uppercase text-foreground">{store.name}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Store</p>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors rounded-sm"
           >
             <LogOut size={20} />
           </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">
        {/* Wallet Overview */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
           <div className="bg-primary/5 border border-primary/20 p-8 space-y-4 relative overflow-hidden group">
              <Wallet className="absolute -right-4 -bottom-4 w-20 h-20 text-primary/10" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1">Available Funds <InfoTooltip text="Earnings ready for withdrawal after platform commission." /></p>
              <div className="flex items-end gap-1">
                 <span className="text-4xl font-black italic tracking-tighter">₹{wallet.walletBalance?.toFixed(2)}</span>
                 <TrendingUp size={16} className="text-emerald-500 mb-2" />
              </div>
           </div>
           
           <div className="bg-surface-low/30 border border-border/10 p-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70 flex items-center gap-1">Frozen Balance <InfoTooltip text="Funds held during active student disputes or investigations." /></p>
              <div className="flex items-end gap-1">
                 <span className="text-4xl font-black italic text-amber-500 tracking-tighter">₹{wallet.frozenBalance?.toFixed(2)}</span>
                 <AlertCircle size={16} className="text-amber-500 mb-2" />
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">{wallet.activeIssues} Open Issue(s)</p>
           </div>

           <div className="bg-surface-low border border-border/10 p-8 md:col-span-2 flex flex-col justify-between group shadow-xl shadow-black/5">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">Initiate Payout <InfoTooltip text="Enter amount to transfer to your linked bank account." /></p>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">Payouts processed in 24h</p>
                  </div>
                  {!wallet.canWithdraw && wallet.activeIssues > 0 && (
                     <div className="bg-destructive/10 text-destructive text-[8px] font-black uppercase px-3 py-1.5 rounded-sm flex items-center gap-2 border border-destructive/20 animate-pulse">
                        <AlertCircle size={10} /> Withdrawals Blocked
                     </div>
                  )}
              </div>
              <div className="flex gap-4 mt-6">
                 <input 
                   type="number" 
                   placeholder="0.00"
                   value={withdrawalAmount}
                   onChange={(e) => setWithdrawalAmount(e.target.value)}
                   className="flex-1 bg-surface-lowest border border-border/10 px-6 py-4 text-xl font-black italic focus:outline-none focus:border-primary transition-all placeholder:opacity-20"
                 />
                 <button 
                   onClick={handleWithdrawal}
                   disabled={!wallet.canWithdraw || !withdrawalAmount}
                   className="bg-foreground text-background px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-20 disabled:grayscale flex items-center gap-3 shadow-2xl"
                 >
                    Request <ArrowUpRight size={16}/>
                 </button>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:items-start">
           {/* RESERVATIONS SECTION */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Live Operations</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-1">Manage active items <InfoTooltip text="Use manual code entry to speed up high-traffic hours." /></p>
                  </div>
                  <button onClick={() => setShowCapacity(true)} className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Plus size={14} /> Adjust Capacity
                  </button>
              </div>

              {/* Table (Desktop) */}
              <div className="hidden md:block bg-surface-low/20 border border-border/5 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-border/5 bg-surface-low/50">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-8">Client Identify</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logistics State</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                       {bookings.map((booking: any) => (
                         <tr key={booking.id} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 pl-8">
                               <p className="font-black text-sm uppercase tracking-tight">{booking.user.name}</p>
                               <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1 opacity-60">
                                  <Phone size={10} /> {booking.user.phone}
                               </div>
                            </td>
                            <td className="p-4">
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                                  booking.status === 'CHECKED_IN' ? 'bg-primary/10 text-primary border-primary/20' : 
                                  booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                               }`}>
                                 {booking.status.replace('_', ' ')}
                               </span>
                            </td>
                            <td className="p-4 text-right pr-8">
                               {booking.status === 'PENDING' && (
                                 <button onClick={() => handleVerify(booking.id, 'CHECK_IN')} className="bg-primary text-primary-foreground px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg hover:shadow-primary/30">Release Locker</button>
                               )}
                               {booking.status === 'CHECKED_IN' && (
                                 <button onClick={() => handleVerify(booking.id, 'CHECK_OUT')} className="bg-emerald-500 text-white px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg hover:shadow-emerald-500/30">Audit Checkout</button>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Cards (Mobile) */}
              <div className="md:hidden grid gap-4">
                {bookings.map((booking: any) => (
                   <div key={booking.id} className="bg-surface-low border border-border/10 p-6 space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="font-black uppercase tracking-tight text-lg">{booking.user.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono italic">{booking.user.phone}</p>
                         </div>
                         <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-sm ${booking.status === 'CHECKED_IN' ? 'bg-primary/20 text-primary' : booking.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                           {booking.status}
                         </span>
                      </div>
                      <div className="pt-4 border-t border-border/5">
                         {booking.status === 'PENDING' && (
                            <button onClick={() => handleVerify(booking.id, 'CHECK_IN')} className="w-full bg-primary text-primary-foreground py-4 text-[10px] font-black uppercase tracking-widest">Check-In</button>
                         )}
                         {booking.status === 'CHECKED_IN' && (
                            <button onClick={() => handleVerify(booking.id, 'CHECK_OUT')} className="w-full bg-emerald-500 text-white py-4 text-[10px] font-black uppercase tracking-widest">Check-Out</button>
                         )}
                      </div>
                   </div>
                ))}
              </div>
           </div>

           {/* VERIFICATION SECTION */}
           <div className="lg:col-span-4 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Manual Valdiation</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Fast-Track Entry</p>
              </div>

              <div className="bg-surface-high p-8 md:p-12 border border-primary/30 space-y-8 shadow-2xl shadow-primary/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary group-hover:h-2 transition-all" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed tracking-widest text-center">Enter the student's 4-digit security code</p>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <input 
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value)}
                          placeholder="0000" 
                          className="w-full bg-background border border-border/10 px-4 py-6 text-center text-4xl font-black tracking-[0.6em] focus:outline-none focus:border-primary transition-all shadow-inner placeholder:opacity-10"
                        />
                     </div>
                     <button 
                       onClick={handleManualVerify}
                       disabled={verifying}
                       className="w-full bg-primary text-primary-foreground py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40"
                     >
                        {verifying ? "Validating..." : "Confirm Access"}
                     </button>
                  </div>
              </div>

              <div className="p-8 bg-surface-low border border-border/5 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">Commission Policy <InfoTooltip text="Our platform fee is 10% on each storage slot booking." /></h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-muted-foreground uppercase">Base Rate</span>
                         <span className="text-sm font-black italic">₹{store.pricePerSlot}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border/5">
                         <span className="text-xs font-bold text-muted-foreground uppercase">Platform Fee</span>
                         <span className="text-sm font-black italic text-destructive">- 10%</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-4 bg-emerald-500/5 border border-emerald-500/10">
                         <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Net Payable</span>
                         <span className="text-lg font-black text-emerald-500 italic">₹{(store.pricePerSlot * 0.9).toFixed(2)}</span>
                      </div>
                   </div>
              </div>
           </div>
        </div>
      </main>

      {/* MODAL: CAPACITY */}
      {showCapacity && (
         <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <div className="bg-surface-low border border-border/10 max-w-sm w-full p-12 space-y-10 relative shadow-2xl">
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Center Scale</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update total available storage slots</p>
               </div>
               <input type="number" value={newCapacity} onChange={(e) => setNewCapacity(parseInt(e.target.value))} className="w-full bg-background p-6 rounded-sm text-center text-4xl font-black italic border border-border/10 shadow-inner" />
               <div className="flex flex-col gap-3">
                  <button onClick={handleUpdateCapacity} className="bg-primary text-primary-foreground py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">Confirm Update</button>
                  <button onClick={() => setShowCapacity(false)} className="py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground">Discard Changes</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
