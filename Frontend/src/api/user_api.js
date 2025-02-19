import { authService } from "./auth_api";

const API_BASE_URL = 'http://localhost:8000/app';

export const userService = {
    async getUserInfo() {
      let token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encuentra el token de autenticación');
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}/user/details/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.status === 401) {
          console.log("Token expirado, intentando refrescar...");
  
          const newToken = await authService.refreshToken();
          
          if (newToken) {
            localStorage.setItem('token', newToken);
  
            const retryResponse = await fetch(`${API_BASE_URL}/user/details/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              }
            });
  
            if (!retryResponse.ok) {
              throw new Error('Error al recuperar la información del usuario tras refrescar el token');
            }
  
            return retryResponse.json();
          } else {
            throw new Error('No se pudo refrescar el token');
          }
        }
  
        if (!response.ok) {
          throw new Error('Error al recuperar la información del usuario');
        }
  
        return response.json();
      } catch (error) {
        console.error("Error en getUserInfo:", error);
        throw error;
      }
    },

};