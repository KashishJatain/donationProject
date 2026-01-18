'use client';
import {useEffect, useState} from 'react';
import {useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
export default function UserDashboard() {
  const router= useRouter();
  const [profile,setProfile]= useState(null);
  const [donations,setDonations] =useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token= localStorage.getItem('token');
    if(!token){
      router.push('/login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData =async (token) => {
    try{
      const [profileRes,donationsRes]=await Promise.all([
        fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/user/donations', {
          headers:{ Authorization: `Bearer ${token}` }
        })
      ]);

      const profileData=await profileRes.json();
      const donationsData=await donationsRes.json();
      setProfile(profileData.user);
      setDonations(donationsData.donations);
    }catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalDonated = donations.filter(d => d.status === 'success').reduce((sum, d) => sum + d.amount, 0);

  return(
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donations</h3>
            <p className="text-3xl font-bold text-blue-600">{donations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donated</h3>
            <p className="text-3xl font-bold text-green-600">₹{totalDonated}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Member Since</h3>
            <p className="text-xl font-bold text-purple-600">
              {new Date(profile?.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            <Link href="/user/edit-profile">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Edit Profile
              </button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{profile?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{profile?.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">{profile?.address || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone Number</p>
              <p className="font-semibold">{profile?.phone || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Donation History</h2>
            <Link href="/user/donate">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Make a Donation
              </button>
            </Link>
          </div>

          {donations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No donations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {donations.map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-4 py-3">
                        {new Date(donation.donationDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{donation.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          donation.status === 'success' ? 'bg-green-100 text-green-800' :
                          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}