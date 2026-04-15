"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, LogOut, Package, Star, ShieldCheck, X, AlertTriangle, List, Map as MapIcon, Info, Phone } from "lucide-react";
import dynamic from 'next/dynamic';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InfoTooltip from "@/components/InfoTooltip";

const StoreMap = dynamic(() => import('@/components/StoreMap'), { ssr: false });

export default function StudentDashboard() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // search | bookings
  const [viewMode, setViewMode] = useState<"list" | "map">("list"); // for mobile search
  
  const [showPayment, setShowPayment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [issueData, setIssueData] = useState({ reason: "Item Misplaced", description: "" });

  useEffect(() => {
    fetchStores();
    fetchBookings();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      if (data.success) setStores(data.data);
    } catch (err) {
      console.error("Fetch stores error", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (err) {
      console.error("Fetch bookings error", err);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const slotPrice = activeBooking?.store?.pricePerSlot || 50;
      const security = 100; 
      const total = slotPrice + security;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: activeBooking.id, amount: total })
      });
      if ((await res.json()).success) {
        toast.success("Payment Successful! Slot Secured.");
        setShowPayment(false);
        fetchBookings();
        setActiveTab("bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          storeId: activeBooking.storeId, 
          rating: reviewData.rating, 
          comment: reviewData.comment 
        })
      });
      if ((await res.json()).success) {
        toast.success("Thank you for your feedback!");
        setShowReview(false);
        fetchBookings();
      }
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const handleReportIssue = async () => {
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: activeBooking.id, 
          ...issueData 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Issue reported. Funds frozen for investigation.");
        setShowIssue(false);
        fetchBookings();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to report issue");
    }
  };

  const handleBooking = async (storeId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          storeId, 
          bookingDate: new Date().toISOString().split('T')[0],
          itemCount: 1 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBooking(data.data);
        setShowPayment(true);
      } else {
        toast.error(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    setRole(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground flex flex-col">
      <header className="border-b border-border/10 bg-surface-low/50 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Package className="text-primary hidden sm:block" size={24} />
          <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic">
            Locker<span className="text-primary not-italic">Link</span>
          </h1>
        </div>

        <nav className="flex items-center gap-1 bg-surface-lowest p-1 rounded-sm border border-border/5">
          <button 
            onClick={() => setActiveTab("search")}
            className={`px-3 md:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'search' ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-low'}`}
          >
            Find Center
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`px-3 md:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-low'}`}
          >
            My Bookings
          </button>
        </nav>

        <button onClick={handleLogout} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors rounded-sm">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === "search" ? (
          <div className="grid lg:grid-cols-12 gap-8 h-full">
            {/* SEARCH & LISTING */}
            <div className={`lg:col-span-4 space-y-6 flex flex-col ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-4 h-4" />
                <input 
                  placeholder="Exam center name..."
                  className="w-full bg-surface-low border border-border/10 px-10 py-4 text-sm focus:outline-none focus:border-primary/5 transition-all font-bold"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {stores.map(store => (
                  <div 
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`p-6 border transition-all cursor-pointer group relative ${selectedStore?.id === store.id ? 'bg-primary/5 border-primary/30' : 'bg-surface-low/30 border-border/5 hover:border-border/20'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{store.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
                         ★ {store.rating?.toFixed(1) || "5.0"}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-6 flex items-center gap-2 font-medium italic">
                      <MapPin size={12} className="text-primary" /> {store.address}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/5">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Pricing</span>
                         <span className="text-sm font-black text-emerald-500 italic">₹{store.pricePerSlot}/slot</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBooking(store.id); }}
                        disabled={loading}
                        className="bg-foreground text-background px-6 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAP VIEW */}
            <div className={`lg:col-span-8 flex flex-col h-[60vh] lg:h-[calc(100vh-160px)] ${viewMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
              <StoreMap 
                stores={stores} 
                onSelectStore={setSelectedStore} 
                center={selectedStore ? [Number(selectedStore.latitude), Number(selectedStore.longitude)] : [28.6139, 77.2090]} 
              />
            </div>

            {/* Mobile View Toggle */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background flex items-center p-1 rounded-full shadow-2xl z-50">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`px-6 py-3 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
               >
                 <List size={14} /> List
               </button>
               <button 
                 onClick={() => setViewMode('map')}
                 className={`px-6 py-3 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : ''}`}
               >
                 <MapIcon size={14} /> Map
               </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Your Reservations</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" /> 4-Digit Passcode Verification Active
                  <InfoTooltip text="Provide your unique OTP to center staff at check-in/out." />
                </p>
             </div>

             <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-surface-low border border-border/10 p-8 relative flex flex-col justify-between group">
                    <div className="absolute top-4 right-4 group-hover:scale-105 transition-transform">
                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-sm border ${
                          booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          booking.status === 'CHECKED_IN' ? 'bg-primary/10 text-primary border-primary/20' : 
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {booking.status}
                        </span>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 flex items-center gap-1">
                          Collection Center <InfoTooltip text="Store name where your items are stored." />
                        </p>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground italic">{booking.store.name}</h3>
                      </div>

                      <div className="flex gap-12">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Date Audit</p>
                          <div className="flex items-center gap-2 text-sm font-bold opacity-80 italic">
                            <Calendar size={14} className="text-primary" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                        </div>
                        {booking.status !== 'COMPLETED' && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 flex items-center gap-1">
                              Pass Code <InfoTooltip text="4-digit security code for verification." />
                            </p>
                            <div className="text-2xl font-black tracking-[0.3em] text-primary bg-primary/5 px-4 py-1 rounded-sm border border-primary/20 italic">{booking.otp}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-border/5">
                        {booking.status === 'COMPLETED' && (
                            <button 
                              onClick={() => { setActiveBooking(booking); setShowReview(true); }}
                              className="flex-1 bg-primary text-primary-foreground py-4 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                            >
                               Rate Experience
                            </button>
                        )}
                        <button 
                          onClick={() => { setActiveBooking(booking); setShowIssue(true); }}
                          className="flex-1 bg-surface-highest text-muted-foreground hover:text-destructive border border-border/10 py-4 text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Report Discrepancy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="col-span-full py-32 text-center border-2 border-dashed border-border/5 rounded-2xl flex flex-col items-center gap-6">
                     <Package size={64} className="text-muted-foreground opacity-10" />
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground">Reservations Feed is Empty</p>
                     <button onClick={() => setActiveTab('search')} className="bg-primary text-primary-foreground px-8 py-3 text-[10px] font-black uppercase tracking-widest">Find Center Now</button>
                  </div>
                )}
             </div>
          </div>
        )}
      </main>

      {/* MODAL: PAYMENT */}
      {showPayment && (
        <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface-low border border-border/10 max-w-md w-full p-8 md:p-12 space-y-10 relative shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
            <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
               <X size={24} />
            </button>

            <div className="text-center space-y-4">
               <ShieldCheck className="mx-auto text-primary" size={64} />
               <h2 className="text-3xl font-black uppercase tracking-tighter italic">Slot Finalization</h2>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                 Includes ₹100 Security Deposit
                 <InfoTooltip text="Refundable security deposit returned upon successful check-out." />
               </p>
            </div>
            
            <div className="space-y-6">
               <div className="p-6 bg-surface-lowest border border-border/5 flex justify-between items-center group-hover:border-primary/20 transition-all">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Net Payable</span>
                  <span className="font-black italic text-3xl text-primary">₹ { (activeBooking?.store?.pricePerSlot || 50) + 100 }</span>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Mock Card Processing</label>
                     <input placeholder="4242 4242 4242 4242" className="w-full bg-surface-lowest border border-border/10 px-4 py-4 text-sm font-black tracking-[0.3em] focus:border-primary focus:outline-none" defaultValue="4242 4242 4242 4242" />
                  </div>
               </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-5 text-[12px] font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30"
            >
               {loading ? "Authorizing..." : "Authorize Transaction"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW */}
      {showReview && (
         <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <div className="bg-surface-low border border-border/10 max-w-md w-full p-10 space-y-8 relative shadow-2xl">
               <button onClick={() => setShowReview(false)} className="absolute top-6 right-6"><X size={24}/></button>
               <div className="text-center">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1">Feedback Audit</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rate the storage center performance</p>
               </div>
               <div className="flex gap-3 justify-center py-6">
                  {[1,2,3,4,5].map(s => (
                     <Star 
                        key={s} 
                        size={40} 
                        className={`cursor-pointer transition-all hover:scale-125 ${s <= reviewData.rating ? 'fill-primary text-primary' : 'text-muted-foreground/10'}`}
                        onClick={() => setReviewData({...reviewData, rating: s})}
                     />
                  ))}
               </div>
               <textarea 
                  placeholder="Share details regarding center staff and security..."
                  className="w-full bg-surface-lowest border border-border/5 p-6 text-sm font-medium h-40 focus:outline-none focus:border-primary transition-all resize-none shadow-inner"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
               />
               <button 
                 onClick={handleReview}
                 className="w-full bg-primary text-primary-foreground py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all"
               >
                  Publish Audit
               </button>
            </div>
         </div>
      )}

      {/* MODAL: ISSUE */}
      {showIssue && (
         <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
            <div className="bg-surface-low border border-border/10 max-w-md w-full p-10 space-y-8 relative border-t-4 border-t-destructive shadow-2xl">
               <button onClick={() => setShowIssue(false)} className="absolute top-6 right-6"><X size={24}/></button>
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-lg"><AlertTriangle className="text-destructive" size={32} /></div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Dispute Report</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      Funds will be frozen during audit <InfoTooltip text="Reporting an issue freezes the vendor earnings for this slot immediately." />
                    </p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Primary Discrepancy</label>
                     <select 
                        className="w-full bg-surface-lowest border border-border/5 p-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-destructive transition-all"
                        value={issueData.reason}
                        onChange={(e) => setIssueData({...issueData, reason: e.target.value})}
                     >
                        <option>Item Misplaced</option>
                        <option>Store Closed / Staff Not Present</option>
                        <option>Staff Misbehavior / Security Concern</option>
                        <option>Security Deposit Conflict</option>
                        <option>Other / Uncategorized</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Factual Description</label>
                     <textarea 
                        placeholder="Provide an objective description of the event..."
                        className="w-full bg-surface-lowest border border-border/5 p-6 text-sm font-medium h-40 focus:outline-none focus:border-destructive transition-all resize-none shadow-inner"
                        value={issueData.description}
                        onChange={(e) => setIssueData({...issueData, description: e.target.value})}
                     />
                  </div>
               </div>
               <button 
                 onClick={handleReportIssue}
                 className="w-full bg-destructive text-white py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl shadow-destructive/20"
               >
                  Authorize Dispute
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
