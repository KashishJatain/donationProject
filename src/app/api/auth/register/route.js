import {NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();
    const {name,email,password,address,phone,role} =await request.json();
    const existingUser=await User.findOne({email,phone});
    if(existingUser){
      return NextResponse.json(
        {message:'Email/Phone no. already registered'},
        {status: 400}
      );
    }
    const user =new User({
      name,
      email,
      address,
      phone,
      password,
      role:role || 'user'
    });
    const userCount=await User.countDocuments();
    if(userCount=== 0){
      user.role = 'admin';
    }
try{
  await user.save();
}catch(err){
  console.error("Error saving user:", err);
  return NextResponse.json(
    {message: "Failed to save user", error: err.message },
    {status: 500 }
  );}
    const token =jwt.sign(
      {userId: user._id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: '7d' }
    );
    console.log("wrk till here")
    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        registrationDate: user.registrationDate,
        role: user.role
      }
    }, {status: 201});
  }catch(error) {
    return NextResponse.json(
      {message:'Registration failed', error: error.message,details: process.env.NODE_ENV=== 'development' ? error.stack : undefined },
      {status: 500 }
    );
  }
}