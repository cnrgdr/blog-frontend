import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { User, Post } from '../types';
import PostCard from '../components/PostCard';

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await api.get(`/users/${userId}`);
        setUser(userRes.data);
        const postsRes = await api.get(`/posts?author=${userId}`);
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error("Profil yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="text-white text-center mt-10">Profil yükleniyor...</div>;
  if (!user) return <div className="text-red-500 text-center mt-10">Kullanıcı bulunamadı.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="shrink-0">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.username} className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center text-gray-500 text-4xl uppercase">{user.username.charAt(0)}</div>
            )}
        </div>
        <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
            {/* 'createdAt' types.ts'de yoksa hata verebilir, isteğe bağlı ekleyin veya bu satırı kaldırın */}
            <p className="text-gray-400 text-sm mb-4">Üye olma tarihi: {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
            {user.bio && <div className="bg-gray-900/50 p-4 rounded-lg text-gray-300 italic">"{user.bio}"</div>}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Paylaşılan Yazılar ({posts.length})</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-10 bg-gray-800/50 rounded-lg">Bu kullanıcı henüz hiç yazı paylaşmamış.</div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;