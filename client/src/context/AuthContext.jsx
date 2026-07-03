import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredAuth,
  getStoredAuth,
  loginRequest,
  persistAuth,
  registerRequest,
  setAuthToken
} from '../api/http.js';

const AuthContext = createContext(null);

const hydrateAuthState = () => {
  const storedAuth = getStoredAuth();

  if (!storedAuth?.token || !storedAuth?.user) {
    return { user: null, token: null };
  }

  setAuthToken(storedAuth.token);
  return storedAuth;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => hydrateAuthState());

  useEffect(() => {
    setAuthToken(authState.token);
  }, [authState.token]);

  const login = async ({ email, password }) => {
    const payload = await loginRequest({ identifier: email, password });
    const nextState = {
      token: payload.token,
      user: {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        username: payload.username,
        role: payload.role
      }
    };

    setAuthState(nextState);
    setAuthToken(nextState.token);
    persistAuth(nextState);

    return nextState;
  };

  const register = async ({ name, email, phone_number, password }) => {
    const payload = await registerRequest({ name, email, phone_number, password });
    const nextState = {
      token: payload.token,
      user: {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        username: payload.username,
        role: payload.role
      }
    };

    setAuthState(nextState);
    setAuthToken(nextState.token);
    persistAuth(nextState);

    return nextState;
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    setAuthToken(null);
    clearStoredAuth();
  };

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      login,
      register,
      logout
    }),
    [authState.token, authState.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
