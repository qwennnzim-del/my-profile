
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Plus, Trash2, Camera, Loader2, Grid, Bookmark } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';

interface InstagramProps {
  isAdmin: boolean;
}

interface InstaPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  timestamp: any;
}

export const Instagram: React.FC<InstagramProps> = ({ isAdmin }) => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [profile, setProfile] = useState({
    displayName: "HEZZELL",
    avatarUrl: "",
    bio: "Digital Artist • Dreamer • Storyteller",
    postsCount: 0,
    followers: "1.2M",
    following: "24"
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'feed' | 'avatar' | null>(null);

  const feedInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Profile & Posts Realtime
  useEffect(() => {
    // Profile
    const unsubProfile = onSnapshot(doc(db, 'settings', 'profile'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile(prev => ({ ...prev, ...data }));
      }
    });

    // Posts
    const q = query(collection(db, 'instagram_posts'), orderBy('timestamp', 'desc'));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InstaPost[];
      setPosts(data);
      setProfile(prev => ({ ...prev, postsCount: data.length }));
    });

    return () => {
      unsubProfile();
      unsubPosts();
    };
  }, []);

  // 2. Direct Upload Logic (INSTANT - No Compression)
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'feed' | 'avatar') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadType(type);

    try {
      // INSTANT UPLOAD: Direct to Firebase Storage
      // Menggunakan timestamp agar nama file unik
      const path = type === 'avatar' 
        ? `profile/avatar_${Date.now()}_${file.name}`
        : `posts/${Date.now()}_${file.name}`;
        
      const storageRef = ref(storage, path);
      
      // Upload raw file directly (Cepat!)
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      if (type === 'avatar') {
        // Update Avatar URL in Firestore
        await setDoc(doc(db, 'settings', 'profile'), {
          avatarUrl: url
        }, { merge: true });
      } else {
        // Create new Post
        await addDoc(collection(db, 'instagram_posts'), {
          imageUrl: url,
          caption: "✨ New visual.",
          likes: 0,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Gagal upload. Cek koneksi internet anda.");
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (feedInputRef.current) feedInputRef.current.value = '';
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm("Hapus postingan ini?")) {
      await deleteDoc(doc(db, 'instagram_posts', id));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-28 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Profile Header - Aesthetic Design */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-16 pb-12 border-b border-slate-200">
        
        {/* Avatar Circle */}
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shadow-xl shadow-rose-500/20">
            <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Camera size={40} />
                </div>
              )}
              
              {/* Overlay Loading */}
              {isUploading && uploadType === 'avatar' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-white w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Admin Avatar Edit Trigger */}
          {isAdmin && (
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-110 active:scale-95 z-20 border-4 border-white"
              title="Ganti Foto Profil"
            >
              <Plus size={18} />
            </button>
          )}
          <input 
            type="file" 
            ref={avatarInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleUpload(e, 'avatar')}
          />
        </div>

        {/* Stats & Info */}
        <div className="flex-1 text-center md:text-left pt-2">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">{profile.displayName}</h2>
            
            <div className="flex gap-2">
                {isAdmin && (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full tracking-wider border border-slate-200">ADMIN MODE</span>
                )}
                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                Follow
                </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-10 mb-6 text-slate-800">
            <div className="text-center md:text-left">
              <span className="font-black block text-xl">{profile.postsCount}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-black block text-xl">{profile.followers}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-black block text-xl">{profile.following}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">following</span>
            </div>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
            <p>{profile.bio}</p>
          </div>
        </div>
      </div>

      {/* Admin Post Action */}
      {isAdmin && (
        <div className="mb-10 flex justify-end">
          <input 
            type="file" 
            ref={feedInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleUpload(e, 'feed')}
          />
          <button 
            onClick={() => feedInputRef.current?.click()}
            disabled={isUploading}
            className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
             {isUploading && uploadType === 'feed' ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
             <span className="group-hover:translate-x-1 transition-transform">New Post</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-16 border-t border-slate-200 mb-10">
        <button className="flex items-center gap-2 py-4 border-t-2 border-slate-900 -mt-[2px] text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors">
          <Grid size={14} /> Feeds
        </button>
        <button className="flex items-center gap-2 py-4 border-t-2 border-transparent text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
          <Bookmark size={14} /> Saved
        </button>
      </div>

      {/* Grid Posts */}
      {posts.length === 0 ? (
        <div className="py-24 text-center text-slate-300 flex flex-col items-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
           <Camera size={48} className="mb-4 opacity-50" />
           <p className="font-serif italic text-lg text-slate-400">"Feed masih kosong, ayo mulai berkarya."</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-8">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square group bg-slate-100 overflow-hidden md:rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500">
              <img 
                src={post.imageUrl} 
                alt="Post" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              
              {/* Overlay Stats */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-8 text-white font-bold backdrop-blur-[2px]">
                 <div className="flex flex-col items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                   <Heart className="fill-white" size={24} />
                   <span className="text-sm">{Math.floor(Math.random() * 500) + 10}</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                   <MessageCircle className="fill-white" size={24} />
                   <span className="text-sm">{Math.floor(Math.random() * 20) + 1}</span>
                 </div>
              </div>

              {/* Delete Button (Admin) */}
              {isAdmin && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-20 shadow-lg"
                  title="Hapus Postingan"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
