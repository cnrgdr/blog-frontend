export interface User {
  _id: string;
  username: string;
  email?: string;
  role?: 'user' | 'admin';
  profileImage?: string;
  bio?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: User;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  role?: 'user' | 'admin';
  isBlocked?: boolean; // <-- BU SATIRI EKLEYİN!
  profileImage?: string;
  bio?: string;
  createdAt?: string; // Bunu da eklemek iyi olur, PublicProfilePage'de kullanmıştık
}
export interface Category { _id: string; name: string; }
export interface Post { _id: string; title: string; content: string; coverImage?: string; author: User; categories: Category[]; createdAt: string; updatedAt: string; }
export interface Comment { _id: string; text: string; author: User; post: string; createdAt: string; }