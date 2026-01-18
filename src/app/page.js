'use client';
import Link from 'next/link';

export default function Home(){
  return(
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-gray-600 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to NGO Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join us in making a difference. Register today and support our cause.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <button className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                Register
              </button>
            </Link>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Easy Registration</h3>
              <p className="text-gray-600">Simple and secure registration process</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Transparent Donations</h3>
              <p className="text-gray-600">Track your contributions easily</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}