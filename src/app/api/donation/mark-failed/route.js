import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';

export async function POST(request) {
  const authResult=await verifyToken(request);
  
  if (authResult.error) {
    return NextResponse.json(
      {message: authResult.error },
      {status: authResult.status}
    );
  }

  try{
    const {orderId} =await request.json();
    await connectDB();
    const donation=await Donation.findOne({razorpayOrderId: orderId });
    if(!donation){
      return NextResponse.json(
        {message: 'Donation not found' },
        {status: 404 }
      );
    }
    donation.status='failed';
    donation.completedAt=new Date();
    await donation.save();

    return NextResponse.json({message: 'Donation marked as failed', status: 'failed' });
  } catch(error) {
    return NextResponse.json(
      { message: 'Failed to update status', error: error.message },
      { status: 500 }
    );}}