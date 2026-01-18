import {NextResponse } from 'next/server';
import {requireAdmin} from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request){
  const authResult =await requireAdmin(request);
  if(authResult.error){
    return NextResponse.json(
      {message: authResult.error },
      {status: authResult.status}
    );
  }
  try{
    await connectDB();
    const {searchParams}= new URL(request.url);
    const search= searchParams.get('search');
    const sortBy= searchParams.get('sortBy') || 'registrationDate';
    const order=searchParams.get('order') || 'desc';
    
    let query ={role: 'admin'}; 
    
    if(search){
      query.$or= [
        {name:{ $regex: search, $options: 'i' }},
        {email:{$regex: search, $options: 'i' }}
      ];
    }
    const admins= await User.find(query)
      .select('-password')
      .sort({[sortBy]: order=== 'desc' ? -1 : 1});

    return NextResponse.json({ admins });
  } catch(error) {
    return NextResponse.json(
      { message: 'Failed to fetch admins', error: error.message },
      { status: 500 }
    );
  }
}