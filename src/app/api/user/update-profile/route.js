import { NextResponse } from 'next/server';
import {verifyToken} from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const authResult=await verifyToken(request);
    
    if (authResult.error){
      return NextResponse.json(
        {message: authResult.error},
        {status:authResult.status}
      );
    }

    const {name, address,phone} =await request.json();
    
    await connectDB();
    
    const user= await User.findByIdAndUpdate(
      authResult.user._id,
      {
        name: name || authResult.user.name,
        address: address || authResult.user.address,
        phone: phone || authResult.user.phone
      },
      { new: true }
    ).select('-password');

    if(!user){
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:'Profile updated successfully',
      user:{
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        registrationDate: user.registrationDate,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Failed to update profile', error: error.message },
      { status: 500 }
    );
  }
}
