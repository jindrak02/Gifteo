/**
 * Fetch wrapper that handles 401 Unauthorized responses globally
 * by reloading the page (which redirects to login)
 * 
 * Used a api base url, so every request has prefix /api/
 * For a dev on localhost the prefix would look like this: http://localhost:3000/api/
 * 
 */
import Swal from "sweetalert2";
import i18n from "i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;

export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  
  let url = input;

  if (typeof input === 'string') {
    // Trochu blbuvzdornosti - Ensure we don't double the slashes
    const endpoint = input.startsWith('/') ? input.substring(1) : input;
    url = `${API_BASE_URL}/${endpoint}`;
  }
  
  const response = await fetch(url, init);
  
  if (response.status === 401) {
    // User is unauthorized - show alert and wait for confirmation before reloading

    // Po 6 sekundách automaticky reloadne stránku
    const timeout = setTimeout(() => {
    window.location.reload();
    }, 6000);
  
    const result = await Swal.fire({
      title: i18n.t("app.swal.sessionExpired.title"),
      text: i18n.t("app.swal.sessionExpired.text"),
      icon: "warning",
      confirmButtonText: "OK",
      confirmButtonColor: "#8F84F2",
    });

    if (result.isConfirmed) {
      // Reload after user clicks "OK"
      clearTimeout(timeout);
      window.location.reload();
    }
    
    // Return a promise that never resolves since we're reloading
    return new Promise(() => {});
  }
  
  return response;
};
