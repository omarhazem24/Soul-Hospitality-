import React, { createContext, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { designTokens } from './tokens.js';

const AppThemeContext = createContext(designTokens);

export const useAppTheme = () => useContext(AppThemeContext);

export const AppThemeProvider = ({ children }) => {
  return (
    <AppThemeContext.Provider value={designTokens}>
      <StyledThemeProvider theme={designTokens}>{children}</StyledThemeProvider>
    </AppThemeContext.Provider>
  );
};
