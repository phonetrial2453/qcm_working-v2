
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
        const { data: settings } = await supabase
          .from('app_settings')
          .select('key, value')
          .eq('key', `user_theme_${session.user.id}`)
          .maybeSingle();
          
        if (settings) {
          const userPrefs = settings.value as { theme?: Theme; theme_color?: ThemeColor };
          
          if (userPrefs.theme) {
            setThemeState(userPrefs.theme);
            localStorage.setItem('theme', userPrefs.theme);
            document.documentElement.classList.toggle('dark', userPrefs.theme === 'dark');
          }
          
          if (userPrefs.theme_color) {
            setThemeColorState(userPrefs.theme_color);
            localStorage.setItem('themeColor', userPrefs.theme_color);
            document.documentElement.setAttribute('data-theme-color', userPrefs.theme_color);
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
      const userId = session.user.id;
      const settingKey = `user_theme_${userId}`;
      
      // First, check if setting exists
      const { data: existingSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();
        
      const updatedValue = {
        ...(existingSetting?.value as object || {}),
        ...(newTheme ? { theme: newTheme } : {}),
        ...(newColor ? { theme_color: newColor } : {})
      };
      
      // Upsert the theme settings
      await supabase
        .from('app_settings')
        .upsert({ 
          key: settingKey,
          value: updatedValue
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
