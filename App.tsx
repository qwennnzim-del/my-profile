
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { GlassCircle } from './GlassCircle';
import { Home } from './Home';
import { Instagram } from './Instagram';
import { Album } from './Album';
import { About } from './About';
import { Contact } from './Contact';
import { collection, onSnapshot, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Lock, Unlock, X } from 'lucide-react';

export interface NotificationItem {
  id: string; 
  message: string;
  time: string;
  read: boolean;
  timestamp?: any;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State untuk Modal Login Kustom
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // 1. Realtime Listener untuk Notifikasi
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'notifications'), 
        orderBy('timestamp', 'desc'), 
        limit(20) // Naikkan limit biar kelihatan history visitor
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          read: false 
        })) as NotificationItem[];
        
        setNotifications(notifs);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error connect firebase:", error);
    }
  }, []);

  // 2. Visitor Tracker (Analytics Sederhana)
  useEffect(() => {
    const trackVisitor = async () => {
      // Cek Session Storage agar tidak spam notif setiap user refresh halaman
      // Notif hanya dikirim sekali per sesi browser (saat tab ditutup, sesi hilang)
      const hasVisited = sessionStorage.getItem('zenith_visitor_logged');

      if (!hasVisited) {
        try {
          // Deteksi Device Sederhana
          const width = window.innerWidth;
          const deviceType = width <= 768 ? "HP 📱" : "Laptop/PC 💻";
          
          // Deteksi Browser (Optional, basic detection)
          const userAgent = navigator.userAgent;
          let browserInfo = "";
          if (userAgent.includes("Chrome")) browserInfo = "Chrome";
          else if (userAgent.includes("Firefox")) browserInfo = "Firefox";
          else if (userAgent.includes("Safari")) browserInfo = "Safari";
          else browserInfo = "Browser Lain";

          // Kirim ke Firebase
          await addDoc(collection(db, 'notifications'), {
            message: `Ada tamu baru yang mampir lihat portofolio via ${deviceType} (${browserInfo}). 👀`,
            time: 'Baru saja',
            timestamp: new Date(),
            read: false,
            type: 'visitor_log'
          });

          // Tandai sesi ini sudah tercatat
          sessionStorage.setItem('zenith_visitor_logged', 'true');
        } catch (error) {
          console.error("Gagal mencatat pengunjung:", error);
        }
      }
    };

    trackVisitor();
  }, []);

  const handleFinishQuiz = async (message: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        message: message,
        time: 'Baru saja',
        timestamp: new Date(),
        read: false
      });
    } catch (e) {
      console.error("Gagal kirim notif", e);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Trigger Login
  const handleAdminTrigger = () => {
    if (isAdmin) {
      if (window.confirm("Yakin ingin keluar dari Mode Admin?")) {
        setIsAdmin(false);
      }
    } else {
      setIsLoginOpen(true);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "HAHAHAQWER") {
      setIsAdmin(true);
      setIsLoginOpen(false);
      setPasswordInput("");
    } else {
      alert("Kunci salah! Coba lagi.");
      setPasswordInput("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col items-center">
      {/* Background Ambience - Ditambahkan pointer-events-none agar tidak menghalangi klik */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <GlassCircle size="700px" top="-10%" left="-10%" gradient="from-indigo-100/40 to-transparent" />
        <GlassCircle size="600px" bottom="-5%" right="-5%" gradient="from-rose-100/40 to-transparent" delay="2s" />
        <GlassCircle size="500px" top="40%" left="30%" gradient="from-blue-100/20 to-transparent" delay="4s" />
      </div>

      {/* Navigation */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        notifications={notifications}
        onOpenNotifications={markAllRead}
      />

      {/* Page Content */}
      <main className="w-full flex-grow relative z-10 mt-10">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'instagram' && <Instagram isAdmin={isAdmin} />}
        {currentPage === 'album' && <Album isAdmin={isAdmin} />}
        {currentPage === 'about' && <About onFinishQuiz={handleFinishQuiz} />}
        {currentPage === 'contact' && <Contact />}
      </main>

      {/* Global Footer & Admin Trigger Button */}
      <footer className="w-full py-8 text-center text-slate-400 text-xs relative z-20 border-t border-slate-100/50 backdrop-blur-sm flex flex-col items-center gap-4 mt-12">
        <p>© 2026 Zenith Portfolio.</p>
        
        <button 
          onClick={handleAdminTrigger}
          className={`group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border shadow-sm cursor-pointer active:scale-95 relative z-50 ${
            isAdmin 
              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
          <span className="uppercase tracking-widest text-[10px] font-bold">
            {isAdmin ? 'Admin Mode Active' : 'Admin Login'}
          </span>
        </button>
      </footer>

      {/* Custom Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative border border-white/50">
              <button 
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-900 shadow-sm">
                  <Lock size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Security Check</h3>
                <p className="text-slate-500 text-sm mt-1">Masukkan kunci rahasia Zenith.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                 <input 
                   type="password" 
                   value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}
                   className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-900 font-bold outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all tracking-[0.3em] placeholder:tracking-normal text-lg"
                   placeholder="Enter Key..."
                   autoFocus
                 />
                 <button 
                   type="submit" 
                   className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 mt-2"
                 >
                   Buka Akses
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
