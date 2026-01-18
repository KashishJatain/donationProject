import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from './db';

export async function verifyToken(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function requireAdmin(request) {
  const authResult = await verifyToken(request);
  
  if (authResult.error) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return authResult;
}