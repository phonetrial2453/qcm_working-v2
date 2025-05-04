
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';
type ThemeColor = 'green' | 'blue' | 'purple' | 'brown' | 'teal' | 'indigo';

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

  // Apply theme color variables
  useEffect(() => {
    // Update CSS variables based on selected color
    updateThemeColorVariables(themeColor, theme);
  }, [themeColor, theme]);

  const updateThemeColorVariables = (color: ThemeColor, currentTheme: Theme) => {
    const isDark = currentTheme === 'dark';
    
    // Define color palettes for each theme color
    const colorPalettes: Record<ThemeColor, { light: Record<string, string>, dark: Record<string, string> }> = {
      green: {
        light: {
          primary: '156 47% 14%',
          secondary: '109 34% 32%',
          accent: '39 100% 61%',
        },
        dark: {
          primary: '156 47% 50%',
          secondary: '109 34% 42%',
          accent: '39 100% 61%',
        }
      },
      blue: {
        light: {
          primary: '210 100% 25%',
          secondary: '210 70% 40%',
          accent: '35 100% 60%',
        },
        dark: {
          primary: '210 100% 50%',
          secondary: '210 70% 60%',
          accent: '35 100% 60%',
        }
      },
      purple: {
        light: {
          primary: '270 50% 30%',
          secondary: '270 30% 50%',
          accent: '330 100% 70%',
        },
        dark: {
          primary: '270 50% 50%',
          secondary: '270 30% 60%',
          accent: '330 100% 70%',
        }
      },
      brown: {
        light: {
          primary: '30 50% 30%',
          secondary: '30 30% 45%',
          accent: '45 100% 60%',
        },
        dark: {
          primary: '30 50% 40%',
          secondary: '30 30% 50%',
          accent: '45 100% 60%',
        }
      },
      teal: {
        light: {
          primary: '180 50% 25%',
          secondary: '180 35% 40%',
          accent: '150 100% 65%',
        },
        dark: {
          primary: '180 50% 40%',
          secondary: '180 35% 50%',
          accent: '150 100% 65%',
        }
      },
      indigo: {
        light: {
          primary: '240 60% 30%',
          secondary: '240 40% 45%',
          accent: '280 100% 70%',
        },
        dark: {
          primary: '240 60% 50%',
          secondary: '240 40% 60%',
          accent: '280 100% 70%',
        }
      },
    };

    // Get the selected color palette
    const palette = colorPalettes[color][isDark ? 'dark' : 'light'];
    
    // Apply the color palette to CSS variables
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Update sidebar colors
    document.documentElement.style.setProperty('--sidebar-primary', palette.accent);
    document.documentElement.style.setProperty('--sidebar-background', palette.primary);
    
    // Update other variables based on the selected color
    if (isDark) {
      document.documentElement.style.setProperty('--background', `${color === 'green' ? '156' : color === 'blue' ? '210' : color === 'purple' ? '270' : color === 'brown' ? '30' : color === 'teal' ? '180' : '240'} 47% 5%`);
      document.documentElement.style.setProperty('--card', `${color === 'green' ? '156' : color === 'blue' ? '210' : color === 'purple' ? '270' : color === 'brown' ? '30' : color === 'teal' ? '180' : '240'} 47% 10%`);
      document.documentElement.style.setProperty('--popover', `${color === 'green' ? '156' : color === 'blue' ? '210' : color === 'purple' ? '270' : color === 'brown' ? '30' : color === 'teal' ? '180' : '240'} 47% 10%`);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Update colors for the new theme
    updateThemeColorVariables(themeColor, newTheme);
    
    // Save to database if user is logged in
    saveUserPreferences({ theme: newTheme });
  };

  const setThemeColor = (newColor: ThemeColor) => {
    setThemeColorState(newColor);
    localStorage.setItem('themeColor', newColor);
    document.documentElement.setAttribute('data-theme-color', newColor);
    
    // Update colors for the new color
    updateThemeColorVariables(newColor, theme);
    
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
