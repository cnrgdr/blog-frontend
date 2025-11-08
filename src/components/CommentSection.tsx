import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Comment } from '../types';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem('userToken');

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error("Yorumlar yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { text: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-500 mt-4">Yorumlar yükleniyor...</div>;

  return (
    <div className="mt-8 bg-gray-900/50 p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-white mb-6">Yorumlar ({comments.length})</h3>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none resize-none" rows={3} placeholder="Yorumunuzu yazın..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
          <button type="submit" disabled={submitting} className={`mt-2 px-4 py-2 rounded text-white font-bold transition-colors ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {submitting ? 'Gönderiliyor...' : 'Yorum Yap'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg mb-8 text-center text-gray-300">
          Yorum yapmak için lütfen <Link to="/login" className="text-blue-400 hover:underline">giriş yapın</Link>.
        </div>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                 {comment.author.profileImage ? (
                   <img src={comment.author.profileImage} alt={comment.author.username} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                   <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                )}
                <span className="text-blue-300 font-medium">{comment.author.username}</span>
              </div>
              <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <p className="text-gray-300">{comment.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-500 text-center">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>}
      </div>
    </div>
  );
};

export default CommentSection;