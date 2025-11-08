import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Post, Category } from '../types';
import PostCard from '../components/PostCard';

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const query = selectedCategoryId ? `?category=${selectedCategoryId}` : '';
        const response = await api.get(`/posts${query}`);
        setPosts(response.data.posts || []);
      } catch (err) {
        setError('Yazılar yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategoryId]);

  if (loading) return <div className="text-white text-center mt-10">Yazılar yükleniyor...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Blogumuza Hoş Geldiniz</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">En güncel teknoloji, yazılım ve hayat üzerine yazılarımızı buradan takip edebilirsiniz.</p>
      </div>
      <div className="flex gap-3 justify-center mb-10 flex-wrap">
        <Link to="/" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategoryId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Tümü</Link>
        {categories.map((cat) => (
          <Link key={cat._id} to={`/?category=${cat._id}`} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategoryId === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {cat.name}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
      {posts.length === 0 && <p className="text-center text-gray-500 mt-10">{selectedCategoryId ? 'Bu kategoride henüz yazı yok.' : 'Henüz hiç yazı yok.'}</p>}
    </div>
  );
};

export default HomePage;