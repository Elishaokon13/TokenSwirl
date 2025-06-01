import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { method, params } = await request.json();

  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const alchemyApiUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

  if (!alchemyApiKey) {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 });
  }

  try {
    const response = await axios.post(alchemyApiUrl, {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Alchemy API error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch data from Alchemy' }, { status: 500 });
  }
} 