
// Custom fetch wrapper function with authorization header
export async function customFetch(url: string, options = {}) {
  const response = await fetch('/api/greenhouse/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, options }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
