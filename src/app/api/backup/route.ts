import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Backup endpoint placeholder' 
  });
}

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'Backup functionality not implemented' 
  }, { status: 501 });
}
