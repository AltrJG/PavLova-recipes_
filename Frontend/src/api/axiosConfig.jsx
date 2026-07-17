import axios from "axios";
import Cookies from 'js-cookie';

const backendAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true, // Para enviar cookies si usas refresh token en backend
});

backendAPI.interceptors.request.use((config) => {
  // Read the cookie directly using js-cookie
  const csrfToken = Cookies.get("csrftoken");
  
  if (csrfToken) {
    // Explicitly set the header Django expects
    config.headers["X-CSRFToken"] = csrfToken;
  }
  
  return config;
});

export default backendAPI;