
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';
type ThemeColor = 'green' | 'blue' | 'purple' | 'brown';

interface ThemeContextType {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [themeColor, setThemeColorState] = useState<ThemeColor>('green');

  useEffect(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem('theme') as Theme;
    const storedColor = localStorage.getItem('themeColor') as ThemeColor;
    
    if (storedTheme) {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
    
    if (storedColor) {
      setThemeColorState(storedColor);
      document.documentElement.setAttribute('data-theme-color', storedColor);
    }
    
    // Then try to fetch from database if user is logged in
    const fetchUserPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('theme, theme_color')
          .eq('user_id', session.user.id)
          .single();
          
        if (preferences) {
          if (preferences.theme) {
            setThemeState(preferences.theme as Theme);
            localStorage.setItem('theme', preferences.theme);
            document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
          }
          
          if (preferences.theme_color) {
            setThemeColorState(preferences.theme_color as ThemeColor);
            localStorage.setItem('themeColor', preferences.theme_color);
            document.documentElement.setAttribute('data-theme-color', preferences.theme_color);
          }
        }
      }
    };
    
    fetchUserPreferences();
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Save to database if user is logged in
    saveUserPreferences({ theme: newTheme });
  };

  const setThemeColor = (newColor: ThemeColor) => {
    setThemeColorState(newColor);
    localStorage.setItem('themeColor', newColor);
    document.documentElement.setAttribute('data-theme-color', newColor);
    
    // Save to database if user is logged in
    saveUserPreferences({ themeColor: newColor });
  };
  
  const saveUserPreferences = async ({ theme: newTheme, themeColor: newColor }: { theme?: Theme, themeColor?: ThemeColor }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const updates: { [key: string]: any } = {};
      
      if (newTheme) updates.theme = newTheme;
      if (newColor) updates.theme_color = newColor;
      
      await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: session.user.id,
          ...updates
        })
        .select();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeColor, setTheme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
