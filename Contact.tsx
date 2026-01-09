
import React from 'react';
import { Mail, MapPin, Phone, Instagram, Dribbble, Twitter } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="w-full flex justify-center py-32 animate-in fade-in zoom-in duration-500 px-6">
       <div className="w-full max-w-5xl bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl p-8 md:p-16 flex flex-col md:flex-row gap-16 overflow-hidden relative">
          
          {/* Decorative Blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-50"></div>

          <div className="flex-1 flex flex-col gap-8 relative z-10">
             <div>
                <h3 className="text-4xl font-serif font-bold text-slate-900 mb-2">Collab Sabi Kali</h3>
                <p className="text-slate-500">Gue open banget buat projek seru atau sekedar ngopi cantik.</p>
             </div>

             <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900"><Mail size={20}/></div>
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                      <p className="text-slate-800">hezell@gmail.com</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900"><Phone size={20}/></div>
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">WhatsApp</p>
                      <p className="text-slate-800">+62 877 2904 4780</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900"><MapPin size={20}/></div>
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Basecamp</p>
                      <p className="text-slate-800">Cianjur Utara, Indo</p>
                   </div>
                </div>
             </div>

             <div className="flex gap-4 mt-8">
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors"><Instagram size={18}/></button>
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors"><Twitter size={18}/></button>
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors"><Dribbble size={18}/></button>
             </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative z-10">
             <form className="flex flex-col gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nama Lo Siapa?</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all" placeholder="Misal: Si Paling Keren" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Spill Email</label>
                   <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all" placeholder="biar bisa dibales" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mau Curhat Apa?</label>
                   <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all min-h-[120px]" placeholder="Tulis aja, jangan dipendem..."></textarea>
                </div>
                <button className="bg-slate-900 text-white font-bold py-4 rounded-xl mt-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Gas Kirim!</button>
             </form>
          </div>
       </div>
    </div>
  );
};
