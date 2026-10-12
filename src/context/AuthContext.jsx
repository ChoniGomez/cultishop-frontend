import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api';

const AuthContext = createContext(null);

/**
 * Valida y parsea la respuesta HTTP de forma segura antes de parsear JSON,
 * evitando fallas como "Unexpected end of JSON input" cuando el servidor
 * responde con contenido vacío o texto plano.
 */
const safeParseJson = async (res) => {
  const text = await res.text();

  if (!text || text.trim() === '') {
    if (!res.ok) {
      throw new Error(`El servidor respondió con código ${res.status} sin contenido.`);
    }
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    if (!res.ok) {
      const cleanSnippet = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      throw new Error(cleanSnippet || `Error en el servidor (${res.status})`);
    }
    throw new Error('La respuesta del servidor no tiene un formato JSON válido.');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cultishop_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cultishop_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('cultishop_user', JSON.stringify(user));
      localStorage.setItem('cultishop_token', token);
    } else {
      localStorage.removeItem('cultishop_user');
      localStorage.removeItem('cultishop_token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('auth/login'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (!data.user || !data.token) {
        throw new Error(data.error || 'Respuesta incompleta del servidor.');
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, isAdult }) => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('auth/register'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, isAdult })
      });

      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      if (!data.user || !data.token) {
        throw new Error(data.error || 'Respuesta incompleta del servidor.');
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      if (!credential) {
        throw new Error('No se recibió la credencial de Google para autenticar.');
      }

      const res = await fetch(buildApiUrl('auth/google'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ credential })
      });

      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || `Error al autenticar con Google (${res.status})`);
      }

      if (!data.user || !data.token) {
        throw new Error(data.error || 'Respuesta incompleta del servidor al autenticar.');
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Error al conectar con Google OAuth.' };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Debes iniciar sesión para cambiar tu contraseña.');
      }

      const res = await fetch(buildApiUrl('auth/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña.');
      }

      return { success: true, message: data.message || 'Contraseña actualizada con éxito.' };
    } catch (err) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      loginWithGoogle, 
      logout,
      changePassword,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
