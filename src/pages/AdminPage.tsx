import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Category, Post, User } from '../types';

const AdminPage = () => {
  const navigate = useNavigate();
  // Hangi sekmenin açık olduğunu tutan state
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'categories'>('posts');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [postSearch, setPostSearch] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [loading, setLoading] = useState(true);

  // 1. Yetki Kontrolü ve İlk Veri Çekme
  useEffect(() => {
    const checkAdmin = async () => {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) { navigate('/login'); return; }
      const user: User = JSON.parse(userInfoStr);
      if (user.role !== 'admin') { alert("Yetkiniz yok!"); navigate('/'); return; }
      
      fetchAllData();
    };
    checkAdmin();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Tüm gerekli verileri paralel olarak çek
      const [catRes, postRes, userRes] = await Promise.all([
        api.get('/categories'),
        api.get('/posts?limit=500'), // Admin için yüksek limit
        api.get('/users')
      ]);
      setCategories(catRes.data);
      setPosts(postRes.data.posts || []);
      setUsers(userRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- KATEGORİ İŞLEMLERİ ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/categories', { name: newCategory });
      alert('Kategori eklendi!');
      setNewCategory('');
      const res = await api.get('/categories'); setCategories(res.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Hata'); }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat._id !== categoryId));
      } catch (err: any) { alert(err.response?.data?.message || "Silinemedi."); }
    }
  }

  // --- YAZI İŞLEMLERİ ---
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try { await api.delete(`/posts/${postId}`); setPosts(posts.filter(p => p._id !== postId)); } 
      catch (error) { alert("Silinemedi."); }
    }
  };
  
  // --- KULLANICI İŞLEMLERİ ---
  const handleToggleBlock = async (userId: string) => {
      if(window.confirm("Engel durumunu değiştirmek istiyor musunuz?")) {
          try {
              await api.put(`/users/${userId}/block`);
              // Kullanıcı listesini güncelle
              setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
          } catch (err:any) { alert(err.response?.data?.message || "İşlem başarısız"); }
      }
  }

  // --- FİLTRELEME (Arama Çubuğu İçin) ---
  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(postSearch.toLowerCase()) || p.author.username.toLowerCase().includes(postSearch.toLowerCase()));
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())));

  if (loading) return <div className="text-white text-center mt-10">Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 pb-20">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Paneli</h1>

      {/* --- SEKME (TAB) MENÜSÜ --- */}
      <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab('posts')} className={`pb-4 px-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
              Yazılar
          </button>
          <button onClick={() => setActiveTab('users')} className={`pb-4 px-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
              Kullanıcılar
          </button>
          <button onClick={() => setActiveTab('categories')} className={`pb-4 px-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'categories' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
              Kategoriler
          </button>
      </div>

      {/* --- 1. YAZILAR SEKMESİ --- */}
      {activeTab === 'posts' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-white">Tüm Yazılar ({filteredPosts.length})</h2>
                <input 
                  type="text" 
                  placeholder="Yazı başlığı veya yazar ara..." 
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none w-full sm:w-64"
                />
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-gray-300 min-w-[600px]">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0"><tr><th className="px-4 py-3">Başlık</th><th className="px-4 py-3">Yazar</th><th className="px-4 py-3">Tarih</th><th className="px-4 py-3 text-right">İşlem</th></tr></thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-white max-w-xs truncate" title={post.title}>
                        <Link to={`/posts/${post._id}`} className="hover:underline">{post.title}</Link>
                      </td>
                      <td className="px-4 py-3">{post.author.username}</td>
                      <td className="px-4 py-3 text-sm">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeletePost(post._id)} className="text-red-400 hover:text-red-300 text-sm font-medium bg-red-900/20 px-3 py-1 rounded transition-colors hover:bg-red-900/40">Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* --- 2. KULLANICILAR SEKMESİ --- */}
      {activeTab === 'users' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-white">Tüm Kullanıcılar ({filteredUsers.length})</h2>
              <input 
                type="text" 
                placeholder="Kullanıcı adı veya e-posta ara..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none w-full sm:w-64"
              />
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-gray-300 min-w-[700px]">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
                  <tr><th className="px-4 py-3">Kullanıcı</th><th className="px-4 py-3">E-posta</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3 text-right">İşlem</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={`border-b border-gray-700 hover:bg-gray-700/30 ${user.isBlocked ? 'bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 flex items-center gap-3">
                        {user.profileImage ? <img src={user.profileImage} className="w-10 h-10 rounded-full object-cover"/> : <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">{user.username.charAt(0).toUpperCase()}</div>}
                        <span className="font-medium text-white">{user.username}</span>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-gray-700 text-gray-300'}`}>{user.role}</span></td>
                    <td className="px-4 py-3">{user.isBlocked ? <span className="text-red-400 font-bold text-xs bg-red-950 px-2 py-1 rounded-full">ENGELLİ</span> : <span className="text-green-400 text-xs bg-green-950 px-2 py-1 rounded-full">Aktif</span>}</td>
                    <td className="px-4 py-3 text-right">
                        {user.role !== 'admin' && (
                            <button onClick={() => handleToggleBlock(user._id)} className={`text-sm font-medium px-3 py-1 rounded transition-colors ${user.isBlocked ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'}`}>
                                {user.isBlocked ? 'Engeli Kaldır' : 'Engelle'}
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
      )}

      {/* --- 3. KATEGORİLER SEKMESİ --- */}
      {activeTab === 'categories' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-xl mx-auto sm:mx-0">
            <h2 className="text-xl font-bold text-white mb-4">Kategoriler</h2>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input type="text" placeholder="Yeni Kategori Adı" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">Ekle</button>
            </form>
            <ul className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map(cat => (
                <li key={cat._id} className="text-gray-300 bg-gray-900/50 p-3 rounded flex justify-between items-center group hover:bg-gray-900 transition-colors">
                  <span className="capitalize font-medium">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2 py-1 rounded hover:bg-red-950/50">
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          </div>
      )}

    </div>
  );
};

export default AdminPage;