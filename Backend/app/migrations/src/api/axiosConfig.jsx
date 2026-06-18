import axios from "axios";

const backendAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true, // Para enviar cookies si usas refresh token en backend
});

export default backendAPI;