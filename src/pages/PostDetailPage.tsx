import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Post } from '../types';
import CommentSection from '../components/CommentSection';

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>(); // URL'den ID'yi al
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Yazı yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) return <div className="text-white text-center mt-10">Yükleniyor...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!post) return <div className="text-white text-center mt-10">Yazı bulunamadı.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      {/* Kapak Resmi */}
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-96 object-cover"
        />
      )}

      <div className="p-8">
        {/* Üst Bilgi: Kategoriler ve Tarih */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {post.categories.map((cat) => (
              <span key={cat._id} className="text-sm bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                {cat.name}
              </span>
            ))}
          </div>
          <span className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Başlık */}
        <h1 className="text-4xl font-bold text-white mb-6">
          {post.title}
        </h1>

        {/* Yazar Bilgisi */}
        <Link to={`/users/${post.author._id}`} className="flex items-center gap-4 mb-8 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group">
           {post.author.profileImage ? (
               <img src={post.author.profileImage} alt={post.author.username} className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-blue-500 transition-all"/>
            ) : (
               <div className="w-12 h-12 rounded-full bg-gray-600 group-hover:ring-2 ring-blue-500 transition-all"></div>
            )}
          <div>
            <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{post.author.username}</p>
            {post.author.bio && <p className="text-gray-400 text-sm">{post.author.bio}</p>}
          </div>
        </Link>

        {/* Yazı İçeriği */}
        {/* Not: İleride buraya Rich Text (HTML) desteği ekleyeceğiz */}
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
          {post.content}
        </div>

        {/* Geri Dön Butonu */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>

     {/* 2. YORUM BÖLÜMÜNÜ EKLE (post._id var olduğundan eminiz burada) */}
      {post && <CommentSection postId={post._id} />}
    </div>
  );
};

export default PostDetailPage;