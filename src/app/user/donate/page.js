'use client';
import { useState,useEffect } from 'react';
import {useRouter} from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Donate() {
  const router= useRouter();
  const [amount,setAmount]= useState('');
  const [loading, setLoading]= useState(false);
  const [message,setMessage]= useState({ type: '',text: '' });

  useEffect(()=> {
    const token= localStorage.getItem('token');
    if(!token){
      router.push('/login');
    }

    const script= document.createElement('script');
    script.src= 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
  const handleDonate=async (e)=>{
    e.preventDefault();
    
    if(!amount || amount<1){
      setMessage({type: 'error',text: 'Please enter a valid amount' });
      return;
    }
    setLoading(true);
    setMessage({type: '',text: '' });

    try{
      const token= localStorage.getItem('token');
      const response=await fetch('/api/donation/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({amount: parseFloat(amount) })
      });
      const data = await response.json();
      if (!response.ok){
        throw new Error(data.message);
      }

      const options= {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'NGO Platform',
        description: 'Donation',
        handler: async function (razorpayResponse) {
          try {
            const verifyResponse = await fetch('/api/donation/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpayOrderId: data.orderId,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature
              })
            });

            const verifyData= await verifyResponse.json();

            if (verifyData.status=== 'success') {
              setMessage({type:'success', text: 'Donation successful! Thank you for your support.' });
              setAmount('');
              setTimeout(()=>router.push('/user/dashboard'), 2000);
            }else{
              setMessage({type: 'error', text:'Payment verification failed!' });
            }
          }catch (error){
            setMessage({type: 'error',text:'Payment verification failed' });
          }
        },
        modal:{
          ondismiss: async function() {
            try{
              await fetch('/api/donation/mark-failed', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: data.orderId })
              });
              setMessage({ type: 'error', text: 'Donation cancelled' });
            }catch(error){
              console.error('Error marking donation as failed:', error);
            }
          }
        }
      };

      const razorpay= new window.Razorpay(options);
      razorpay.open();
    } catch(error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create donation order' });
    } finally{
      setLoading(false);
    }
  };

  return(
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Make a Donation</h1>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleDonate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Amounts:</h3>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="text-blue-600 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}