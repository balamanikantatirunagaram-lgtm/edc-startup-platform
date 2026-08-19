import { login } from '@/services/auth.service';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const res = await login('EdcAdmin', 'Niat@2025');
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
