import {NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try{
    await connectDB();
    const {email,password }=await request.json();
    const user =await User.findOne({ email });
    if(!user){
      return NextResponse.json(
        {message: 'Invalid credentials'},
        {status:401}
      );
    }
    const isValidPassword=await user.comparePassword(password);
    if(!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    const token=jwt.sign(
      {userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {expiresIn: '7d' }
    );
    return NextResponse.json({
      message:'Login successful',
      token,
      user:{
        id: user._id,
        name:user.name,
        email:user.email,
        role:user.role
      }
    });
  }catch (error){
    return NextResponse.json(
      {message: 'Login failed',error: error.message },
      {status: 500 }
    );
  }
}