import {NextResponse } from 'next/server';
import {requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Donation from '@/models/Donation';

export async function GET(request) {
  const authResult=await requireAdmin(request);
  if(authResult.error){
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }
  try {
    await connectDB();
    const {searchParams}=new URL(request.url);
    const search=searchParams.get('search');
    const sortBy=searchParams.get('sortBy') || 'registrationDate';
    const order=searchParams.get('order') || 'desc';
    
    let query={role: 'user'}; 
    if(search){
      query.$or=[
        {name:{$regex: search,$options:'i'}},
        {email:{ $regex:search,$options:'i' }},
        {address:{ $regex:search, $options:'i' }},
        {phone:{ $regex:search, $options: 'i'}}
      ];}
    const users = await User.find(query).select('-password')
      .sort({[sortBy]: order=== 'desc'? -1 : 1 });
    const userIds=users.map(user => user._id);
    const donationTotals= await Donation.aggregate([
      {
        $match:{
          user:{ $in: userIds },
          status: 'success' 
        }
      },
      {
        $group:{
          _id: '$user',
          totalDonated:{ $sum: '$amount' },
          donationCount:{$sum: 1 }
        }
      }
    ]);
    const donationMap= {};
    donationTotals.forEach(item=> {
      donationMap[item._id.toString()]= {
        totalDonated:item.totalDonated,
        donationCount: item.donationCount
      };
    });
    const usersWithDonations =users.map(user=>{
      const userObj= user.toObject();
      const donations= donationMap[user._id.toString()] || { 
        totalDonated: 0, 
        donationCount: 0 
      };
      return{
        ...userObj,
        totalDonated: donations.totalDonated,
        donationCount: donations.donationCount
      };
    });
    return NextResponse.json({ users: usersWithDonations });
  }catch(error){
    return NextResponse.json(
      {message:'Failed to fetch users', error: error.message },
      {status: 500}
    );
  }
}