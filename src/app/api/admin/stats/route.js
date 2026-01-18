import {NextResponse } from 'next/server';
import {requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Donation from '@/models/Donation';

export async function GET(request) {
  const authResult= await requireAdmin(request);
  if(authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }
  try{
    await connectDB();
    const totalUsers= await User.countDocuments({ role: 'user' });
    const adminUsers= await User.countDocuments({ role: 'admin' });
    const totalDonations= await Donation.countDocuments();
    const successfulDonations= await Donation.countDocuments({ status: 'success' });
    const pendingDonations=await Donation.countDocuments({ status: 'pending' });
    const failedDonations= await Donation.countDocuments({ status: 'failed' });
    const totalAmount=await Donation.aggregate([
      { $match:{status: 'success' } },
      { $group:{ _id: null, total:{$sum: '$amount' } } }
    ]);

    return NextResponse.json({
      totalUsers,
      adminUsers,
      totalDonations,
      successfulDonations,
      pendingDonations,
      failedDonations,
      totalAmountCollected: totalAmount[0]?.total || 0
    });
  }catch(error){
    return NextResponse.json(
      { message: 'Failed to fetch stats', error: error.message },
      { status: 500 }
    );
  }
}