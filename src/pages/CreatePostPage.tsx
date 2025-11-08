import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Category } from '../types';


const CreatePostPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Sayfa açıldığında kategorileri çek (Checkbox için)
  useEffect(() => {
    api.get('/categories')
       .then(res => setCategories(res.data))
       .catch(err => console.error("Kategoriler yüklenemedi", err));
  }, []);

  // 2. Dosya seçildiğinde çalışacak fonksiyon
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 3. Kategori seçimini yöneten fonksiyon
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId) // Zaten seçiliyse çıkar
        : [...prev, categoryId] // Seçili değilse ekle
    );
  };

  // 4. Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- KRİTİK NOKTA: FormData Kullanımı ---
      // Dosya yüklerken JSON yerine FormData kullanmalıyız
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (selectedFile) {
        formData.append('coverImage', selectedFile); // Backend bu ismi bekliyor
      }
      // Kategorileri virgülle ayrılmış string olarak gönderelim (Backend bunu işleyebiliyor)
      if (selectedCategories.length > 0) {
         formData.append('categories', selectedCategories.join(','));
      }

      // Axios, FormData'yı görünce otomatik olarak 'multipart/form-data' başlığını ayarlar
      const response = await api.post('/posts', formData);

      console.log('Yazı oluşturuldu:', response.data);
      alert('Yazınız başarıyla yayınlandı!');
      navigate('/'); // Ana sayfaya dön

    } catch (err: any) {
      setError(err.response?.data?.message || 'Yazı oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-white mb-6">Yeni Yazı Oluştur</h1>
      
      {error && <div className="bg-red-500 text-white p-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Başlık</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            placeholder="Yazınızın etkileyici başlığı..."
            required
          />
        </div>

        {/* Kapak Resmi */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Kapak Resmi</label>
          <input
            type="file"
            accept="image/*" // Sadece resim dosyalarını kabul et
            onChange={handleFileChange}
            className="w-full p-2 rounded bg-gray-700 text-gray-300 border border-gray-600 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        {/* Kategoriler (Checkbox Listesi) */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Kategoriler</label>
          <div className="flex flex-wrap gap-3 p-3 bg-gray-700/50 rounded border border-gray-600">
            {categories.length > 0 ? categories.map((cat) => (
              <label key={cat._id} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded bg-gray-600 border-gray-500"
                  checked={selectedCategories.includes(cat._id)}
                  onChange={() => handleCategoryChange(cat._id)}
                />
                <span className="ml-2 text-gray-300 capitalize">{cat.name}</span>
              </label>
            )) : <span className="text-gray-500 text-sm">Hiç kategori bulunamadı.</span>}
          </div>
        </div>

        {/* İçerik */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">İçerik</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none resize-y"
            placeholder="Blog yazınızı buraya yazın..."
            required
          />
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${
             loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Yayınlanıyor...' : 'Yazıyı Yayınla'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;