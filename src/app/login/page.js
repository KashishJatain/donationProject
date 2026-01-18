'use client';
import {useState } from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router= useRouter();
  const [formData,setFormData]= useState({email: '',password: '' });
  const [error,setError]= useState('');
  const [loading, setLoading]= useState(false);

  const handleSubmit =async (e) =>{
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Login failed');}
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if(data.user.role === 'admin'){
        router.push('/admin/dashboard');
      }else {
        router.push('/user/dashboard');
      }
    } catch (err){
      setError(err.message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-gray-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
         <Link 
          href="/"
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
        >
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg> Home
              </button>
        </Link>
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}