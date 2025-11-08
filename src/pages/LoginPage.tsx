import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Az önce oluşturduğumuz axios servisi

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Sayfa yönlendirmesi için

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setError(''); // Eski hataları temizle

    try {
      // 1. Backend'e POST isteği at
      const response = await api.post('/users/login', {
        email: email,
        password: password,
      });

      // 2. Başarılıysa, gelen token'ı tarayıcıya (localStorage) kaydet
      console.log('Giriş Başarılı:', response.data);
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data)); // Kullanıcı bilgilerini de saklayalım

      // 3. Ana sayfaya yönlendir
      alert("Giriş Başarılı! Ana sayfaya yönlendiriliyorsunuz.");
      navigate('/');

    } catch (err: any) {
      // 4. Hata varsa göster
      // Backend'den gelen hata mesajını yakala (err.response.data.message)
      const errorMessage = err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Giriş Yap</h2>
        
        {/* Hata Mesajı Kutusu */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 block mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="ornek@mail.com"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="******"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;