import {NextResponse } from 'next/server';
import {verifyToken} from '@/lib/auth';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';

export async function GET(request) {
  const authResult=await verifyToken(request);
  if(authResult.error){
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }
  try{
    await connectDB();
    const donations = await Donation.find({ user: authResult.user._id })
      .sort({ donationDate: -1 });

    return NextResponse.json({ donations });
  } catch (error){
    return NextResponse.json(
      { message: 'Failed to fetch donations', error: error.message },
      { status: 500 }
    );
  }}