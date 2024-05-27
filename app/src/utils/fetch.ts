import { env } from "process";


const API_TOKEN = env.GREENHOUSE_API_HARVEST;

interface CustomFetchOptions extends RequestInit {
    headers?: HeadersInit;
    query?: Record<string, unknown>;
}

// Custom fetch wrapper function with authorization header
export const customFetch = async (
  url: string,
  options: CustomFetchOptions = {}
): Promise<Record<string, unknown>[]> => {
  const headers: HeadersInit = {
    Authorization: `Basic ${btoa(API_TOKEN + ":")}`, // Encode API token for Basic Auth
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.query) {
      const queryParams = new URLSearchParams(options.query as Record<string, string>).toString();
      url = `${url}?${queryParams}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const responseData = (await response.json()) as Record<string, unknown>[];
  return responseData;
};
