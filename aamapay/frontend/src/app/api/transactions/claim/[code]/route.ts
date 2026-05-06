import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const response = await fetch(`${API_URL}/api/transactions/claim/${params.code}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${API_URL}/api/transactions/claim/${params.code}/redeem`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}