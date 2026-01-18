import {NextResponse} from 'next/server';
import {verifyToken } from '@/lib/auth';

export async function GET(request) {
  const authResult =await verifyToken(request);
  if(authResult.error){
    return NextResponse.json(
      {message:authResult.error},
      {status: authResult.status }
    );}

  return NextResponse.json({
    user: {
      id:authResult.user._id,
      name: authResult.user.name,
      email:authResult.user.email,
      address:authResult.user.address,
      phone:authResult.user.phone,
      registrationDate: authResult.user.registrationDate
    }
  });
}