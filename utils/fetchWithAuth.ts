/**
 * Fetch wrapper that handles 401 Unauthorized responses globally
 * by reloading the page (which redirects to login)
 */
import Swal from "sweetalert2";

export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await fetch(input, init);
  
  if (response.status === 401) {
    // User is unauthorized - show alert and wait for confirmation before reloading

    // Po 6 sekundách automaticky reloadne stránku
    const timeout = setTimeout(() => {
    window.location.reload();
    }, 6000);
  
    const result = await Swal.fire({
      title: "Session expired",
      text: "Please log in again",
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
