import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { User, Post } from '../types';
import PostCard from '../components/PostCard';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // --- PROFİL STATE'LERİ ---
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- YAZILARIM STATE'LERİ ---
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // --- ŞİFRE DEĞİŞTİRME STATE'LERİ ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // 1. SAYFA YÜKLENDİĞİNDE VERİLERİ ÇEK
  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        // A) Profili çek
        const profileRes = await api.get('/users/profile');
        const userData = profileRes.data;
        setUser(userData);
        setUsername(userData.username);
        setBio(userData.bio || '');
        setPreviewUrl(userData.profileImage || null);

        // B) Kullanıcının yazılarını çek
        setPostsLoading(true);
        const postsRes = await api.get(`/posts?author=${userData._id}`);
        setMyPosts(postsRes.data.posts || []); 
        setPostsLoading(false);

      } catch (err) {
        console.error("Profil verileri yüklenemedi", err);
        navigate('/login'); 
      }
    };
    fetchProfileAndPosts();
  }, [navigate]);

  // 2. DOSYA SEÇİM HANDLER'I
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. PROFİL GÜNCELLEME HANDLER'I
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await api.put('/users/profile', formData);
      
      setUser(response.data);
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
      localStorage.setItem('userInfo', JSON.stringify(response.data));

    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Güncelleme başarısız.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. ŞİFRE DEĞİŞTİRME HANDLER'I
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/users/update-password', {
        currentPassword,
        newPassword,
      });
      
      setPasswordMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Şifre değiştirilemedi.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <div className="text-white text-center mt-10">Profil yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 pb-20">
      
      {/* --- BÖLÜM 1: PROFİL BİLGİLERİ --- */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-10">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Profilim</h1>

        {message.text && (
          <div className={`p-3 rounded mb-6 text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Profil Resmi */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-32 h-32 relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Profil" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center text-gray-500 text-4xl">?</div>
              )}
              <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                📷
              </label>
              <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Inputlar */}
          <div>
            <label className="block text-gray-300 mb-2">Kullanıcı Adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">E-posta</label>
            <input type="email" value={user.email} disabled className="w-full p-3 rounded bg-gray-900/50 text-gray-500 border border-gray-800 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Hakkımda (Bio)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={250} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none resize-none" placeholder="Kendinizden kısaca bahsedin..." />
            <p className="text-right text-gray-500 text-sm mt-1">{bio.length}/250</p>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
          </button>
        </form>
      </div>

      {/* --- BÖLÜM 2: ŞİFRE DEĞİŞTİR --- */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
          Şifre Değiştir
        </h2>

        {passwordMessage.text && (
          <div className={`p-3 rounded mb-6 text-center ${passwordMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Mevcut Şifre</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Yeni Şifre</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" placeholder="En az 6 karakter" required />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Yeni Şifre (Tekrar)</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" required />
            </div>
          </div>
          <button type="submit" disabled={passwordLoading} className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${passwordLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
            {passwordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>

      {/* --- BÖLÜM 3: YAZILARIM --- */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
          Yazılarım ({myPosts.length})
        </h2>
        {postsLoading ? (
          <div className="text-gray-400">Yazılarınız yükleniyor...</div>
        ) : myPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-10 bg-gray-800/50 rounded-lg">
            Henüz hiç yazı paylaşmadınız.
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;