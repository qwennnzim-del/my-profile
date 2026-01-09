
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Trash2, Edit2, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
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
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `albums/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'albums'), {
        imageUrl: url,
        title: "Judul Momen",
        description: "Tulis deskripsi kenangan di sini...",
        timestamp: new Date()
      });
    } catch (error) {
      console.error(error);
      alert("Gagal upload album.");
    } finally {
      setIsUploading(false);
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
      
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-serif font-black text-slate-900 mb-4 tracking-tighter">
          Album.
        </h2>
        <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">
          Koleksi visual yang gak bisa dijelasin kata-kata. <br/>
          Just vibes, memories, and everything in between.
        </p>
      </div>

      {/* Admin Action */}
      {isAdmin && (
        <div className="flex justify-center mb-12">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
            Tambah Koleksi
          </button>
        </div>
      )}

      {/* Gallery Grid (Masonry-ish via CSS Columns) */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <ImageIcon className="text-slate-300 w-16 h-16 mb-4" />
          <p className="text-slate-400 font-medium">Album masih kosong melompong.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid bg-white rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-100 group">
              
              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-4 relative">
                <img src={photo.imageUrl} alt={photo.title} className="w-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-2 pb-2">
                {editingId === photo.id ? (
                  <div className="flex flex-col gap-3">
                    <input 
                      className="text-lg font-bold font-serif text-slate-900 border-b border-slate-300 outline-none pb-1 bg-transparent"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Judul"
                    />
                    <textarea 
                      className="text-sm text-slate-600 border border-slate-200 rounded-lg p-2 outline-none bg-slate-50"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      placeholder="Deskripsi..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                      <button onClick={() => saveEdit(photo.id)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"><Check size={18} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 leading-tight">
                        {photo.title}
                      </h3>
                      {isAdmin && (
                        <button onClick={() => startEditing(photo)} className="text-slate-300 hover:text-blue-500 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 font-light leading-relaxed">
                      {photo.description}
                    </p>
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
