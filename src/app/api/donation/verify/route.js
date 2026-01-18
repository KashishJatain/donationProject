import {NextResponse} from 'next/server';
import crypto from 'crypto';
import {verifyToken} from '@/lib/auth';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';

export async function POST(request) {
  const authResult =await verifyToken(request);
  if (authResult.error) {
    return NextResponse.json(
      {message: authResult.error},
      { status: authResult.status }
    );
  }
  try {
    const {razorpayOrderId,razorpayPaymentId,razorpaySignature }= await request.json();

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    await connectDB();
    const donation = await Donation.findOne({ razorpayOrderId });
    if (!donation) {
      return NextResponse.json(
        {message: 'Donation not found' },
        {status: 404 }
      );
    }
    donation.razorpayPaymentId= razorpayPaymentId;
    donation.razorpaySignature= razorpaySignature;
    donation.status= isValid ? 'success' : 'failed';
    donation.completedAt=new Date();
    await donation.save();
    return NextResponse.json({
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed',
      status: donation.status
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Payment verification failed', error: error.message },
      { status: 500 }
    );
  }
}