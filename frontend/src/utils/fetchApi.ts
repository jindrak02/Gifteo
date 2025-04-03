/**
 * Fetch wrapper that uses default API URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL

if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined. Did you forget to set .env?");
}

export const fetchApi = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  
  let url = input;
  
  if (typeof input === 'string') {
    // Trochu blbuvzdornosti - Ensure we don't double the slashes
    const endpoint = input.startsWith('/') ? input.substring(1) : input;
    url = `${API_BASE_URL}/${endpoint}`;
  }
  
  const response = await fetch(url, init);
  
  return response;
};
