/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getGreenhouseApiToken } from '@/server/actions/greenhouse/query';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url, options }: { url: string; options: RequestInit & { query?: Record<string, string> } } = await request.json();

    const apiToken = await getGreenhouseApiToken();
    if (!apiToken) {
      return NextResponse.json({ error: 'API token not found for the current organization' }, { status: 400 });
    }

    const headers: HeadersInit = {
      Authorization: `Basic ${btoa(apiToken + ":")}`, // Encode API token for Basic Auth
      "Content-Type": "application/json",
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
