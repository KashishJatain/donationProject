'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router= useRouter();
  const [formData,setFormData]= useState({
    name: '',
    email: '',
    address:'',
    phone:'',
    password: '',
    confirmPassword:'',
    role: 'user'
  });
  const [error,setError]= useState('');
  const [loading,setLoading]=useState(false);
  const validateEmail= (email) => {
  const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
  const handleSubmit =async (e)=> {
    e.preventDefault();
    setError('');
    setLoading(true);
    if(!validateEmail(formData.email)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }
    if(formData.password!== formData.confirmPassword){
      setError('Passwords do not match');
      return;
    }
    try{
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if(data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }catch(err) {
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
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData,name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.email}
              onChange={(e)=> setFormData({...formData,email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Address
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.address}
              onChange={(e)=> setFormData({ ...formData,address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.phone}
              onChange={(e) =>setFormData({...formData,phone: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.password}
              onChange={(e)=> setFormData({...formData,password: e.target.value })}
            />
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={formData.confirmPassword}
                  onChange={(e)=> setFormData({...formData,confirmPassword: e.target.value })}
                />
              </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}