import {NextResponse} from 'next/server';
import Razorpay from 'razorpay';
import {verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';

const razorpay =new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(request) {
  const authResult=await verifyToken(request);
  if(authResult.error) {
    return NextResponse.json(
      {message: authResult.error},
      {status: authResult.status}
    );
  }
  try{
    const {amount } =await request.json();
    if (!amount || amount < 1) {
      return NextResponse.json(
        {message: 'Invalid amount' },
        {status: 400 }
      );
    }
    const options ={
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    const order=await razorpay.orders.create(options);
    await connectDB();
    const donation= new Donation({
      user: authResult.user._id,
      amount,
      razorpayOrderId: order.id,
      status: 'pending'
    });
    await donation.save();
    console.log('no prblm in donation create');
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      donationId: donation._id
    });
  } catch (error){
    return NextResponse.json(
      { message: 'Order creation failed', error: error.message },
      { status: 500 }
    );
  }}