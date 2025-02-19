const API_BASE_URL = 'http://localhost:8000/app';

let refreshingPromise = null;

export const authService = {

  //Login *****************************************************************************************************

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  //Register *****************************************************************************************************

  async register(nombre, correo, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, correo, password }),
    });
    return response.json();
  },

  //Logout *****************************************************************************************************

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  //Refresh Token *****************************************************************************************************


  async refreshToken() {
    if (refreshingPromise) {
      return refreshingPromise;
    }

    refreshingPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error('No se pudo renovar el token');
        }

        const data = await response.json();
        const newAccessToken = data.access;
        localStorage.setItem('token', newAccessToken);
        return newAccessToken;
      } catch (error) {
        console.error("Error al renovar el token:", error);
        localStorage.removeItem('token');
        window.location.href = '/auth/iniciar-sesion';
        return null;
      } finally {
        refreshingPromise = null;
      }
    })();

    return refreshingPromise;
  },

  //Fetch with Auth *****************************************************************************************************
  
  async fetchWithAuth(url, options = {}) {
    const accessToken = localStorage.getItem('token');

    if (!accessToken) {
      throw new Error('No se encontró el token de acceso');
    }

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    options.credentials = 'include';

    let response = await fetch(url, options);

    if (response.status === 401) {
      const newAccessToken = await this.refreshToken();

      if (newAccessToken) {
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, options);
      }
    }

    return response;
  }
};