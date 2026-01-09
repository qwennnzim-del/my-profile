
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, Heart, MessageCircle, Share2, Bookmark, Trash2, Loader2, Edit2, Check, X, Settings, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';

interface InstagramProps {
  isAdmin: boolean;
}

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: any;
}

interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  postsCount: string;
  followersCount: string;
  followingCount: string;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "hezzell",
  username: "account.hezzel",
  bio: "Cuma aesthetic dumps biasa.\nKadang rajin upload, kadang ghosting. ☁️✨",
  avatarUrl: "", // Kosong berarti pakai inisial
  postsCount: "0",
  followersCount: "454",
  followingCount: "102"
};

export const Instagram: React.FC<InstagramProps> = ({ isAdmin }) => {
  const [images, setImages] = useState<InstagramPost[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit Feed State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InstagramPost[];
      setImages(posts);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Profile Data
  useEffect(() => {
    const unsubProfile = onSnapshot(doc(db, 'settings', 'profile'), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
        setTempProfile(doc.data() as UserProfile);
      }
    });
    return () => unsubProfile;
  }, []);

  // --- Logic Feed ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'posts'), {
        imageUrl: downloadURL,
        caption: "Cakep parah gak sih? Vibes only ✨",
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Gagal upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Yakin mau hapus kenangan ini?")) return;
    try {
        await deleteDoc(doc(db, 'posts', id));
    } catch (error) { console.error(error); }
  };

  const startEditing = (post: InstagramPost) => {
    setEditingId(post.id);
    setEditCaption(post.caption);
  };

  const saveCaption = async (id: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), { caption: editCaption });
      setEditingId(null);
    } catch (error) { console.error(error); }
  };

  // --- Logic Profile ---
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSavingProfile(true);
    try {
      const storageRef = ref(storage, `avatar/profile_pic_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTempProfile(prev => ({ ...prev, avatarUrl: url }));
    } catch (e) {
      console.error(e);
      alert("Gagal ganti foto profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Simpan ke dokumen 'settings/profile' (singleton)
      await setDoc(doc(db, 'settings', 'profile'), tempProfile);
      setIsEditingProfile(false);
    } catch (e) {
      console.error(e);
      alert("Gagal simpan profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 py-32 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto relative">
      
      {/* Modal Edit Profile */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-serif font-bold text-xl">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  {tempProfile.avatarUrl ? (
                    <img src={tempProfile.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">Img</div>
                  )}
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Upload size={14} /> Ganti Foto
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Username (Atas)</label>
                <input 
                  value={tempProfile.username} 
                  onChange={e => setTempProfile({...tempProfile, username: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Display Name (Tebal)</label>
                <input 
                  value={tempProfile.displayName} 
                  onChange={e => setTempProfile({...tempProfile, displayName: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Bio</label>
                <textarea 
                  value={tempProfile.bio} 
                  onChange={e => setTempProfile({...tempProfile, bio: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Posts</label>
                   <input type="number" value={tempProfile.postsCount} disabled className="w-full p-2 bg-slate-100 text-slate-400 rounded-lg text-sm" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Followers</label>
                   <input type="text" value={tempProfile.followersCount} onChange={e => setTempProfile({...tempProfile, followersCount: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Following</label>
                   <input type="text" value={tempProfile.followingCount} onChange={e => setTempProfile({...tempProfile, followingCount: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <button 
              onClick={saveProfile}
              disabled={isSavingProfile}
              className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2"
            >
              {isSavingProfile ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 px-4 md:px-12 relative group/header">
        
        {/* Admin Edit Button */}
        {isAdmin && (
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="absolute -top-4 -right-4 md:top-0 md:right-0 bg-white border border-slate-200 p-2 rounded-full shadow-md text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all z-20"
            title="Edit Profile Info"
          >
            <Settings size={18} />
          </button>
        )}

        <div className="relative group cursor-default">
          <div className="w-24 h-24 md:w-36 md:h-36 flex-shrink-0 aspect-square rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 relative overflow-hidden">
            <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden relative">
               <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-4xl font-bold text-slate-300">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 flex-grow text-center md:text-left">
           <div>
             <h2 className="text-2xl md:text-3xl font-light text-slate-900 mb-2">{profile.username}</h2>
             <div className="flex items-center justify-center md:justify-start gap-3">
               <span className="font-semibold text-slate-900">{profile.displayName}</span>
               <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">she/her</span>
             </div>
           </div>

           <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base border-t md:border-t-0 border-slate-100 py-4 md:py-0 mt-2">
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-slate-900">{images.length}</span>
                <span className="text-slate-600">kiriman</span>
              </div>
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-slate-900">{profile.followersCount}</span>
                <span className="text-slate-600">pengikut</span>
              </div>
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-slate-900">{profile.followingCount}</span>
                <span className="text-slate-600">mengikuti</span>
              </div>
           </div>

           <p className="text-slate-600 text-sm leading-relaxed hidden md:block whitespace-pre-line">
             {profile.bio}
           </p>
        </div>
      </div>

      <div className="border-t border-slate-200 mb-8"></div>

      {/* Upload Action (ADMIN ONLY) */}
      {isAdmin && (
        <div className="flex justify-end mb-8 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex flex-col items-end gap-2 w-full">
            <div className="flex justify-between w-full items-center mb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Admin Control</span>
              <span className="text-xs text-green-400 font-bold">● Active</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} 
              {isUploading ? 'Mengupload...' : 'Upload Foto Baru'}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {images.length === 0 ? (
        <div className="w-full aspect-square md:aspect-[21/9] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
            <Camera size={32} strokeWidth={1} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Feed Kosong</h3>
          <p className="font-light text-sm mt-1">Belum ada moment yang dibagikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((post) => (
            <div key={post.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-serif overflow-hidden">
                      {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover"/> : profile.displayName.charAt(0).toUpperCase()}
                   </div>
                   <span className="font-semibold text-sm">{profile.username}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => removeImage(post.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                 <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              <div className="p-4">
                 <div className="flex justify-between mb-3">
                    <div className="flex gap-4">
                       <Heart size={24} className="cursor-pointer hover:text-red-500 transition-colors text-slate-800" />
                       <MessageCircle size={24} className="cursor-pointer hover:text-blue-500 transition-colors text-slate-800" />
                       <Share2 size={24} className="cursor-pointer hover:text-green-500 transition-colors text-slate-800" />
                    </div>
                    <Bookmark size={24} className="cursor-pointer hover:text-yellow-500 transition-colors text-slate-800" />
                 </div>
                 
                 <div className="mt-2">
                   {editingId === post.id ? (
                     <div className="flex items-center gap-2 mt-2">
                       <input 
                         type="text" 
                         value={editCaption}
                         onChange={(e) => setEditCaption(e.target.value)}
                         className="flex-grow border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-slate-900"
                         autoFocus
                       />
                       <button onClick={() => saveCaption(post.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16}/></button>
                       <button onClick={() => setEditingId(null)} className="text-red-400 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-600 group/caption relative">
                        <span className="font-semibold text-slate-900 mr-2">{profile.username}</span>
                        {post.caption}
                        {isAdmin && (
                          <button 
                            onClick={() => startEditing(post)}
                            className="ml-2 inline-block opacity-0 group-hover/caption:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                     </p>
                   )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
