import {NextResponse } from 'next/server';
import {requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/db';
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
    console.log('ConnectDB wrking');
    const {searchParams}=new URL(request.url);
    const status=searchParams.get('status');
    const sortBy= searchParams.get('sortBy') || 'donationDate';
    const order=searchParams.get('order') || 'desc';
    let query={};
    if(status) {
      query.status = status;
    }
    const donations= await Donation.find(query)
      .populate('user','name email')
      .sort({ [sortBy]:order === 'desc' ? -1 : 1 });
    console.log('DonationsFetchedd');
    return NextResponse.json({ donations });
  }catch(error) {
    return NextResponse.json(
      {message: 'Failed to fetch donations',error: error.message },
      { status: 500 }
    );
  }
}