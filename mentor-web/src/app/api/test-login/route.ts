import { NextResponse } from 'next/server';
import { login } from '@/services/auth.service';

export async function GET() {
  try {
    const res = await login("mentor1", "password");
    return NextResponse.json({ result: res });
  } catch (err: any) {
    return NextResponse.json({ error: String(err), stack: err.stack }, { status: 500 });
  }
}
