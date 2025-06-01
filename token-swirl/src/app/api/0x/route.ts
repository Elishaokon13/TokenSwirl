import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json({ error: 'Missing required parameters (sellToken, buyToken, sellAmount)' }, { status: 400 });
  }

  const zeroXApiKey = process.env.ZERX_API_KEY; // Corrected environment variable name
  // Use the Base API endpoint for 0x
  const zeroXApiUrl = `https://base.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}`;

  if (!zeroXApiKey) {
    return NextResponse.json({ error: '0x API key not configured' }, { status: 500 });
  }

  try {
    const response = await axios.get(zeroXApiUrl, {
      headers: {
        '0x-api-key': zeroXApiKey,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('0x API error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch data from 0x API' }, { status: 500 });
  }
} 