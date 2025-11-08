import React from 'react';
import type { Post } from '../types';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">Resim Yok</div>
      )}
      <div className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          {post.categories.map((cat) => (
            <Link key={cat._id} to={`/?category=${cat._id}`} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full hover:bg-blue-800 transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-blue-400">
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </h2>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.content}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-3">
          
          {/* --- GÜNCELLENEN KISIM: YAZAR LİNKİ --- */}
          <Link to={`/users/${post.author._id}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
            {post.author.profileImage ? (
               <img src={post.author.profileImage} alt={post.author.username} className="w-6 h-6 rounded-full object-cover group-hover:ring-1 ring-blue-400"/>
            ) : (
               <div className="w-6 h-6 rounded-full bg-gray-600 group-hover:ring-1 ring-blue-400"></div>
            )}
            <span className="text-gray-300 group-hover:text-blue-400">{post.author.username}</span>
          </Link>
          {/* -------------------------------------- */}

          <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;