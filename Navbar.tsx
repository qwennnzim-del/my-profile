
import React, { useState } from 'react';
import { X, ArrowRight, Bell } from 'lucide-react';
import { NotificationItem } from './App';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, notifications, onOpenNotifications }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', desc: 'Back to base' },
    { id: 'instagram', label: 'Feeds', desc: 'Stok foto estetik' },
    { id: 'album', label: 'Album', desc: 'Galeri momen penting' },
    { id: 'about', label: 'Quiz Iseng', desc: 'Cek seberapa asik lo' },
    { id: 'contact', label: 'Call Me', desc: 'Ngobrol santuy' },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const toggleNotif = () => {
    if (!isNotifOpen) {
      onOpenNotifications();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl transition-all duration-300">
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full px-8 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.05)] relative">
          
          {/* Logo Zenith - Desain Megah */}
          <div 
            className="flex items-center gap-2 cursor-pointer z-50 relative group"
            onClick={() => handleNavigate('home')}
          >
            <span className="font-serif text-3xl md:text-4xl font-black tracking-tighter text-slate-900 group-hover:opacity-70 transition-opacity drop-shadow-sm">
              Zenith.
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={toggleNotif}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors relative"
              >
                <Bell size={22} className="text-slate-900" />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute top-16 right-0 w-80 md:w-96 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-5 border-b border-slate-100 bg-white/40">
                    <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Notifikasi</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Bell size={18} />
                        </div>
                        <p className="text-slate-400 text-xs font-medium">Belum ada kabar terbaru.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-5 border-b border-slate-50 hover:bg-white/60 transition-colors cursor-default">
                          <p className="text-sm text-slate-800 leading-relaxed font-medium">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 font-bold mt-2 block uppercase tracking-widest">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Button (2 Lines) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group flex flex-col items-end gap-1.5 p-2 hover:opacity-70 transition-opacity z-50 relative focus:outline-none"
            >
              <div className={`w-8 h-[2px] bg-slate-900 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></div>
              <div className={`w-6 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-8 ${isMenuOpen ? '-rotate-45 -translate-y-[3.5px] w-8' : ''}`}></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/90 backdrop-blur-3xl z-40 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] flex items-center justify-center ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="w-full max-w-2xl px-6 flex flex-col gap-6">
           {navItems.map((item, index) => (
             <div 
               key={item.id}
               onClick={() => handleNavigate(item.id)}
               className={`group flex items-center justify-between border-b border-slate-200 pb-6 cursor-pointer transition-all duration-700 delay-[${index * 100}ms] ${
                 isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
               }`}
               style={{ transitionDelay: `${index * 100}ms` }}
             >
                <div>
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1 block group-hover:text-slate-900 transition-colors">0{index + 1}</span>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 group-hover:translate-x-4 transition-transform duration-300">
                    {item.label}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                  <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
             </div>
           ))}
        </div>

        {/* Decorative Circle in Menu */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-slate-400 text-sm">
          <p>Zenith Portfolio © 2026</p>
        </div>
      </div>
    </>
  );
};
