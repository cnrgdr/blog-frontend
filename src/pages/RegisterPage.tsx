import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Backend'e KAYIT isteği at
      const response = await api.post('/users/register', {
        username,
        email,
        password,
      });

      // 2. Başarılıysa, otomatik giriş yap (token'ı kaydet)
      console.log('Kayıt Başarılı:', response.data);
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));

      // 3. Ana sayfaya yönlendir
      alert("Kayıt Başarılı! Hoş geldiniz.");
      navigate('/');

    } catch (err: any) {
      // Backend'den gelen hatayı yakala
      // (Validation middleware'den gelen 'errors' dizisi veya genel 'message')
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Validation hatalarını (örn: "Şifre en az 6 karakter olmalı") yakala
        errorMessage = Object.values(err.response.data.errors[0])[0] as string;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Kayıt Ol</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 block mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="kullaniciadim"
              required
            />
          </div>

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
              placeholder="****** (en az 6 karakter)"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Kayıt Ol
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;