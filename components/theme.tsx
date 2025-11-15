// Centralized theme definitions and context
import React, { createContext, useContext, useState } from 'react';
import { useAppState } from './AppStateContext';

export const themes = {
  peachy: {
    background: '#FFF7F0', // pastel peach
    card: '#FFE5DF', // lighter peach
    text: '#7A4E3B', // soft brown for text
    accent: '#FFB7B2', // pastel pink accent
    period: '#FFB7B2', // pastel pink for period
    fertile: '#FFE5B4', // pastel beige for fertile
    ovulation: '#FFD1DC', // soft pink for ovulation
    border: '#FADCD9', // very light pink-beige border
  todayColor: '#E53935', // red for today
    error: '#FF8C8C', // soft red for errors
    inputBg: '#FFF0E6', // very light peach for inputs
    inputText: '#7A4E3B',
    legendText: '#BFA6A0', // muted brown for legends
    fabText: '#FFF7F0',
    modalBg: '#FFE5DF',
    borderWidth: 1,
    datePicker: 'light',
  },
};

export type Theme = typeof themes.peachy;

// Remove ThemeProvider and ThemeContext, and instead provide a hook that uses AppStateContext

export const useTheme = () => {
  // Always use the peachy theme
  return { theme: themes.peachy, setThemeName: () => {}, themeName: 'peachy' as const };
};
