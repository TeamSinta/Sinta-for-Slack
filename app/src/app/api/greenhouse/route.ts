/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getGreenhouseApiToken } from '@/server/actions/greenhouse/query';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log("here!"); // Check if this is being logged
  try {
    const { url, options }: { url: string; options: RequestInit & { query?: Record<string, string> } } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL not provided' }, { status: 400 });
    }


    const apiToken = "25a7b6ef73d938fefe4972c4832c02a6"
    if (!apiToken) {
      return NextResponse.json({ error: 'API token not found for the current organization' }, { status: 400 });
    }


    const headers: HeadersInit = {
      Authorization: `Basic MjVhN2I2ZWY3M2Q5MzhmZWZlNDk3MmM0ODMyYzAyYTYtODo=`, // Encode API token for Basic Auth
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let requestUrl = url;
    if (options.query) {
      const queryParams = new URLSearchParams(options.query).toString();
      requestUrl = `${url}?${queryParams}`;
    }


    const response = await fetch(requestUrl, { ...options, headers });

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP error! Status: ${response.status}` }, { status: response.status });
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
