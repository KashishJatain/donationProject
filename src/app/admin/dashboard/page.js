'use client';
import {useEffect,useState } from 'react';
import {useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const router= useRouter();
  const [stats,setStats]=useState(null);
  const [users, setUsers]= useState([]);
  const [adminUsers, setAdminUsers]= useState([]);
  const [donations,setDonations]= useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchTerm,setSearchTerm]= useState('');
  const [statusFilter, setStatusFilter]= useState('');
  const [loading, setLoading] = useState(true);
  const [showAddAdminModal, setShowAddAdminModal]=useState(false);
  const [adminForm, setAdminForm] =useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [formError,setFormError]= useState('');
  const [formSuccess, setFormSuccess]= useState('');

  useEffect(()=>{
    const token= localStorage.getItem('token');
    const user= JSON.parse(localStorage.getItem('user') || '{}');
    
    if(!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData=async (token)=> {
    try{
      const [statsRes, usersRes, adminsRes, donationsRes]= await Promise.all([
        fetch('/api/admin/stats', {
          headers:{ Authorization: `Bearer ${token}`}
        }),
        fetch('/api/admin/users', {
          headers:{ Authorization: `Bearer ${token}`}
        }),
        fetch('/api/admin/admins', {
          headers:{Authorization: `Bearer ${token}`}
        }),
        fetch('/api/admin/donations', {
          headers:{ Authorization: `Bearer ${token}`}
        })
      ]);

      const statsData= await statsRes.json();
      const usersData= await usersRes.json();
      const adminsData=await adminsRes.json();
      const donationsData= await donationsRes.json();
      setStats(statsData);
      setUsers(usersData.users);
      setAdminUsers(adminsData.admins || []);
      setDonations(donationsData.donations);
    }catch(error){
      console.error('Error fetching data:', error);
    } finally{
      setLoading(false);
    }
  };

  const handleAddAdmin= async (e)=> {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if(adminForm.password !==adminForm.confirmPassword){
      setFormError('Passwords do not match');
      return;
    }
    if(adminForm.password.length< 6){
      setFormError('Password must be at least 6 characters');
      return;
    }
    try{
      const response = await fetch('/api/auth/register',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          address:adminForm.address,
          phone: adminForm.phone,
          password:adminForm.password,
          role: 'admin'
        }),
      });

      const data =await response.json();

      if(response.ok){
        setFormSuccess('Admin added successfully!');
        setAdminForm({name: '', email: '', password: '',confirmPassword: '' });
        
        const token=localStorage.getItem('token');
        fetchData(token);

        setTimeout(()=> {
          setShowAddAdminModal(false);
          setFormSuccess('');
        }, 2000);
      }else{
        setFormError(data.message || 'Failed to add admin');
      }
    }catch(error) {
      setFormError('An error occurred while adding admin');
      console.error('Error:', error);
    }
  };

  const exportUsers=async () => {
    const token=localStorage.getItem('token');
    try{
      const response = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }catch(error) {
      console.error('Export failed:', error);
    }
  };

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
 const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDonations =statusFilter
    ? donations.filter(d=> d.status=== statusFilter)
    : donations;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={()=> setActiveTab('stats')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={()=> setActiveTab('users')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Users
          </button>
          <button
            onClick={()=>setActiveTab('admins')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'admins' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Admins
          </button>
          <button
            onClick={()=>setActiveTab('donations')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'donations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Donations
          </button>
        </div>

        {activeTab==='stats' && stats && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Users (non-Admins)</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Admins</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalDonations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Amount Collected</h3>
              <p className="text-3xl font-bold text-green-600">₹{stats.totalAmountCollected}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Successful Donations</h3>
              <p className="text-3xl font-bold text-green-600">{stats.successfulDonations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Donations</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingDonations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Failed Donations</h3>
              <p className="text-3xl font-bold text-red-600">{stats.failedDonations}</p>
            </div>
          </div>
        )}

        {activeTab=== 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="flex gap-4 flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 border border-gray-300 rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e)=> setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportUsers}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phone no.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Donations</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Amount donated</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) =>(
                    <tr key={user._id}>
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.address}</td>
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {user.donationCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">
                          ₹{user.totalDonated || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Admin Users</h2>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminUsers.map((admin) => (
                    <tr key={admin._id}>
                      <td className="px-4 py-3">{admin.name}</td>
                      <td className="px-4 py-3">{admin.email}</td>
                      <td className="px-4 py-3">{admin.address || 'N/A'}</td>
                      <td className="px-4 py-3">{admin.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {new Date(admin.registrationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDonations.map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold">{donation.user.name}</div>
                          <div className="text-sm text-gray-600">{donation.user.email}</div>
                        </div>
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
                      <td className="px-4 py-3">
                        {new Date(donation.donationDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Admin</h2>
              <button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setFormError('');
                  setFormSuccess('');
                  setAdminForm({ name: '', email: '',address:'',phone: '', password: '', confirmPassword: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={adminForm.address}
                  onChange={(e) => setAdminForm({ ...adminForm, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
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
                  value={adminForm.confirmPassword}
                  onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg text-sm">
                  {formSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAdminModal(false);
                    setFormError('');
                    setFormSuccess('');
                    setAdminForm({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}