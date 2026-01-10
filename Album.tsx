
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';

interface AlbumProps {
  isAdmin: boolean;
}

interface AlbumPhoto {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  timestamp: any;
}

export const Album: React.FC<AlbumProps> = ({ isAdmin }) => {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State untuk form edit
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'albums'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AlbumPhoto[];
      setPhotos(data);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Proses upload secara paralel
      // Kita hapus compressImage agar prosesnya INSTAN
      const uploadPromises = Array.from(files).map(async (file: File, index: number) => {
        try {
          // 1. Direct Upload ke Firebase Storage (File Mentah)
          // Nama file dibuat unik dengan timestamp
          const storageRef = ref(storage, `albums/${Date.now()}_${index}_${file.name}`);
          
          // UploadBytes jauh lebih cepat daripada memproses canvas di browser
          await uploadBytes(storageRef, file); 
          const url = await getDownloadURL(storageRef);

          // 2. Simpan Metadata ke Firestore
          await addDoc(collection(db, 'albums'), {
            imageUrl: url,
            title: "Momen Baru",
            description: "Belum ada deskripsi.",
            timestamp: new Date()
          });

          setUploadProgress(prev => prev + 1);
          
        } catch (err) {
          console.error(`Gagal upload file ${file.name}:`, err);
        }
      });

      await Promise.all(uploadPromises);

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload album.");
    } finally {
      setIsUploading(false);
      // Reset input agar bisa pilih file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus foto ini dari album?")) {
      await deleteDoc(doc(db, 'albums', id));
    }
  };

  const startEditing = (photo: AlbumPhoto) => {
    setEditingId(photo.id);
    setEditTitle(photo.title);
    setEditDesc(photo.description);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'albums', id), {
        title: editTitle,
        description: editDesc
      });
      setEditingId(null);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Estetik Zenith */}
      <div className="text-center mb-20 relative">
        <h2 className="text-6xl md:text-8xl font-serif font-black text-slate-900 mb-6 tracking-tighter drop-shadow-sm">
          Album.
        </h2>
        <div className="h-1 w-24 bg-slate-900 mx-auto mb-6"></div>
        <p className="text-slate-500 text-lg md:text-xl font-light max-w-2xl mx-auto italic leading-relaxed">
          "Koleksi visual yang gak bisa dijelasin kata-kata. <br/>
          Just vibes, memories, and pure aesthetics."
        </p>
      </div>

      {/* Admin Action */}
      {isAdmin && (
        <div className="flex flex-col items-center justify-center mb-16 gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            multiple 
            onChange={handleUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group relative bg-slate-900 text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 overflow-hidden shadow-2xl shadow-slate-900/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
            <span className="relative z-10">{isUploading ? `Mengupload...` : 'Tambah Foto Baru'}</span>
          </button>
          {isUploading && (
             <p className="text-sm text-slate-400 font-medium animate-pulse tracking-wide">
               Sedang mengupload ke cloud... Mohon tunggu.
             </p>
          )}
        </div>
      )}

      {/* Gallery Grid (Masonry Style via CSS Columns) */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-300 rounded-[3rem] bg-slate-50/50 backdrop-blur-sm">
          <ImageIcon className="text-slate-300 w-20 h-20 mb-6" />
          <p className="text-slate-400 font-serif text-xl italic">Belum ada kenangan yang disimpan.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-all duration-500 border border-white group hover:-translate-y-2">
              
              {/* Image Container */}
              <div className="rounded-2xl overflow-hidden mb-5 relative bg-slate-100">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title} 
                  className="w-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" 
                  loading="lazy" 
                />
                
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="bg-white/90 p-2.5 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-lg backdrop-blur-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-2 pb-2">
                {editingId === photo.id ? (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-300 bg-slate-50 p-4 rounded-xl">
                    <input 
                      className="text-xl font-bold font-serif text-slate-900 border-b border-slate-300 outline-none pb-2 bg-transparent placeholder:text-slate-300"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Judul Momen"
                      autoFocus
                    />
                    <textarea 
                      className="text-sm text-slate-600 border border-slate-200 rounded-lg p-3 outline-none bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      placeholder="Ceritakan sedikit..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"><X size={20} /></button>
                      <button onClick={() => saveEdit(photo.id)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg"><Check size={20} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-2xl font-bold font-serif text-slate-900 mb-2 leading-tight tracking-tight">
                        {photo.title}
                      </h3>
                      {isAdmin && (
                        <button onClick={() => startEditing(photo)} className="text-slate-300 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100 p-1">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-500 font-light leading-relaxed text-sm">
                      {photo.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                         Zenith Gallery
                       </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
