import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import type { Post, User } from './types';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PublicProfilePage from './pages/PublicProfilePage'; // <-- YENİ İMPORT

function App() {
  const isLoggedIn = !!localStorage.getItem('userToken');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Post[]>([]);
  const [showLiveResults, setShowLiveResults] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        try { setCurrentUser(JSON.parse(userInfoString)); } 
        catch (error) { handleLogout(); }
      }
    } else { setCurrentUser(null); }
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await api.get(`/posts/search?q=${searchQuery}`);
          setLiveResults(response.data); setShowLiveResults(true);
        } catch (error) { console.error(error); }
      } else { setLiveResults([]); setShowLiveResults(false); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { setShowLiveResults(false); navigate(`/search?q=${searchQuery}`); }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken'); localStorage.removeItem('userInfo');
    alert("Başarıyla çıkış yapıldı."); window.location.href = '/'; 
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8" onClick={() => setShowLiveResults(false)}>
      <nav className="flex flex-wrap gap-4 mb-8 items-center border-b border-gray-800 pb-4 justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-white">BlogLogo</Link>
          <Link to="/" className="text-gray-300 hover:text-white hidden md:block">Ana Sayfa</Link>
        </div>
        <div className="flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input type="text" placeholder="Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (searchQuery.length >= 2) setShowLiveResults(true); }} className="w-full bg-gray-800 text-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-600" />
              <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
          </form>
          {showLiveResults && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto">
              {liveResults.length > 0 ? (
                <ul>{liveResults.map((post) => (<li key={post._id} className="border-b border-gray-700 last:border-none"><Link to={`/posts/${post._id}`} className="block p-3 hover:bg-gray-700 flex items-center gap-3" onClick={() => setShowLiveResults(false)}>{post.coverImage && <img src={post.coverImage} className="w-10 h-10 object-cover rounded" />}<div><div className="text-white font-medium line-clamp-1">{post.title}</div><div className="text-gray-500 text-xs">{post.author.username}</div></div></Link></li>))}</ul>
              ) : (<div className="p-3 text-gray-500 text-center">Sonuç yok.</div>)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
               {currentUser?.role === 'admin' && <Link to="/admin" className="text-red-400 hover:text-red-300 font-medium">Admin</Link>}
               <Link to="/create-post" className="hidden md:block text-blue-400 hover:text-blue-300">+ Yazı Yaz</Link>
               <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white group">
                 {currentUser?.profileImage ? <img src={currentUser.profileImage} className="w-8 h-8 rounded-full object-cover group-hover:border-blue-500 border-2 border-transparent transition-all" /> : <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold group-hover:border-blue-500 border-2 border-transparent transition-all">{currentUser?.username?.charAt(0).toUpperCase()}</div>}
                 <span className="hidden md:inline-block font-medium">{currentUser?.username || 'Profil'}</span>
               </Link>
               <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm">Çıkış</button>
            </>
          ) : (
            <><Link to="/login" className="text-gray-300 hover:text-white">Giriş Yap</Link><Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded font-medium">Kayıt Ol</Link></>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/users/:userId" element={<PublicProfilePage />} /> {/* <-- YENİ ROTA */}
      </Routes>
    </div>
  );
}

export default App;