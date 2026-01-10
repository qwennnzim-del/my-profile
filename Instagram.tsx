
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

  // 2. Direct Upload Logic (No Compression)
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'feed' | 'avatar') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadType(type);

    try {
      // INSTANT UPLOAD: Direct to Firebase Storage
      const path = type === 'avatar' 
        ? `profile/avatar_${Date.now()}_${file.name}`
        : `posts/${Date.now()}_${file.name}`;
        
      const storageRef = ref(storage, path);
      
      // Upload raw file directly
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
      alert("Gagal upload. Cek koneksi.");
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
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-16 pb-12 border-b border-slate-200">
        
        {/* Avatar Circle */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
            <div className="w-full h-full rounded-full border-2 border-white bg-white overflow-hidden relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Camera size={32} />
                </div>
              )}
              
              {/* Overlay Loading */}
              {isUploading && uploadType === 'avatar' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Admin Avatar Edit */}
          {isAdmin && (
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
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
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h2 className="text-2xl font-serif font-bold text-slate-900">{profile.displayName}</h2>
            {isAdmin && (
               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Owner Mode</span>
            )}
            <button className="bg-slate-900 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
              Follow
            </button>
          </div>

          <div className="flex justify-center md:justify-start gap-8 mb-6 text-slate-800">
            <div className="text-center md:text-left">
              <span className="font-bold block text-lg">{profile.postsCount}</span>
              <span className="text-slate-500 text-sm">posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold block text-lg">{profile.followers}</span>
              <span className="text-slate-500 text-sm">followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold block text-lg">{profile.following}</span>
              <span className="text-slate-500 text-sm">following</span>
            </div>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto md:mx-0">
            <p className="font-medium">{profile.bio}</p>
          </div>
        </div>
      </div>

      {/* Admin Post Action */}
      {isAdmin && (
        <div className="mb-8 flex justify-end">
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
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
             {isUploading && uploadType === 'feed' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
             New Post
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-12 border-t border-slate-200 mb-8">
        <button className="flex items-center gap-2 py-4 border-t border-slate-900 -mt-px text-slate-900 font-bold text-xs uppercase tracking-widest">
          <Grid size={14} /> Posts
        </button>
        <button className="flex items-center gap-2 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600">
          <Bookmark size={14} /> Saved
        </button>
      </div>

      {/* Grid Posts */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-slate-300 flex flex-col items-center">
           <Camera size={48} className="mb-4 opacity-50" />
           <p className="font-light">Belum ada postingan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-8">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square group bg-slate-100 overflow-hidden md:rounded-2xl">
              <img 
                src={post.imageUrl} 
                alt="Post" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              
              {/* Overlay Stats */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold">
                 <div className="flex items-center gap-2">
                   <Heart className="fill-white" size={20} />
                   <span>{Math.floor(Math.random() * 500) + 10}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <MessageCircle className="fill-white" size={20} />
                   <span>{Math.floor(Math.random() * 20) + 1}</span>
                 </div>
              </div>

              {/* Delete Button (Admin) */}
              {isAdmin && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
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
