const API_BASE_URL = 'http://localhost:8000/app';

export const authService = {
  async register(nombre, correo, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, correo, password }),
    });
    return response.json();
  }
};