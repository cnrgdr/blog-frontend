import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Post } from '../types'; 
import PostCard from '../components/PostCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // URL'den 'q' parametresini al (örn: ?q=react)
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Backend'deki Atlas Search endpoint'ine istek at
        const response = await api.get(`/posts/search?q=${query}`);
        setPosts(response.data);
      } catch (error) {
        console.error("Arama hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]); // 'query' her değiştiğinde yeniden çalış

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        "{query}" için arama sonuçları
      </h1>

      {loading ? (
        <div className="text-gray-400">Aranıyor...</div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-lg">
          Malesef, aramanızla eşleşen bir yazı bulunamadı.
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;