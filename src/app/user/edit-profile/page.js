'use client';
import {useEffect,useState } from 'react';
import {useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function EditProfile() {
  const router= useRouter();
  const [formData,setFormData]= useState({
    name: '',
    address: '',
    phone: ''
  });
  const [loading,setLoading]= useState(true);
  const [saving,setSaving]= useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(()=>{
    const token= localStorage.getItem('token');
    if(!token){
      router.push('/login');
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async(token) => {
    try{
      const res =await fetch('/api/user/profile', {
        headers: {Authorization: `Bearer ${token}` }
      });
      const data= await res.json();
      if(data.user) {
        setFormData({
          name: data.user.name || '',
          address: data.user.address || '',
          phone: data.user.phone || ''
        });}
    }catch(err) {
      setError('Failed to fetch profile');
    }finally {
      setLoading(false);
    }
  };

  const handleSubmit= async (e)=>{
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token= localStorage.getItem('token');
    
    try{
      const res=await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data= await res.json();

      if(!res.ok){
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(()=>{
        router.push('/user/dashboard');
      }, 1500);
    }catch(err){
      setError(err.message);
    }finally{
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  if(loading){
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  return(
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/user/dashboard">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition mb-6">
            ← Back to Dashboard
          </button>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Address
              </label>
              <input
                type="text"
                name="address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );}

  