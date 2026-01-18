import {NextResponse } from 'next/server';
import {requireAdmin} from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Donation from '@/models/Donation';

export async function GET(request){
  const authResult= await requireAdmin(request);
  if(authResult.error){
    return NextResponse.json(
      {message:authResult.error },
      {status:authResult.status }
    );
  }
  try{
    await connectDB();
    const users =await User.find({role: 'user' }).select('-password');
    const userIds= users.map(user => user._id);
    const donationTotals= await Donation.aggregate([
      {
        $match:{
          user: { $in: userIds },
          status: 'success' 
        }
      },{
        $group:{
          _id: '$user',
          totalDonated: { $sum: '$amount' },
          donationCount:{ $sum: 1 }
        }
      }
    ]);
    const donationMap= {};
    donationTotals.forEach(item=> {
      donationMap[item._id.toString()]= {
        totalDonated: item.totalDonated,
        donationCount: item.donationCount
      };
    });
    let csv = 'Name,Email,Address,Phone,Total Donations,Total Amount Donated,Registration Date\n';
    users.forEach(user => {
      const donations = donationMap[user._id.toString()] || { 
        totalDonated: 0, 
        donationCount: 0 
      };
      const name=user.name.includes(',') ? `"${user.name}"` : user.name;
      const email= user.email.includes(',') ? `"${user.email}"` : user.email;
      const address=user.address && user.address.includes(',') ? `"${user.address}"` : (user.address || 'N/A');
      const phone=user.phone || 'N/A';
      
      csv += `${name},${email},${address},${phone},${donations.donationCount},₹${donations.totalDonated},${new Date(user.registrationDate).toLocaleDateString()}\n`;
    });
   console.log('Csv generate wrked ');
    return new NextResponse(csv,{
      headers:{
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition':'attachment; filename=users.csv'
      }
    });
  }catch(error) {
    return NextResponse.json(
      { message: 'Export failed', error: error.message },
      { status: 500 }
    );
  }
}